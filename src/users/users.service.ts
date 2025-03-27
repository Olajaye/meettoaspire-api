import { MailService } from './../mail/mail.service';
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Prisma, User, UserNotificationStatus } from '@prisma/client';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { PrismaTransaction, UserIncludeOptions, UserWithRelations } from 'src/helper/custom-types';
import Utils from 'src/helper/utils';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import Config from 'src/helper/config';
import { EmailVerificationResponseDto } from 'src/common-modules/common-dto/email-verification-response.dto';
import { UserProfileUpdateDto } from './dtos/user-profile-update.dto';
import { UserChangePasswordDTO } from './dtos/user-change-password.dto';
import { FilterUsersDTO } from './dtos/filterUser.dto';
import { getUserFullName, UserProfileDto } from 'src/common-modules/common-dto/user-profile.dto';
import { ValidResponse } from 'src/helper/valid-response';


@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async authUser(): Promise<UserWithRelations> {
    const authInfo = this.request.user;
    if (authInfo?.id) {
      const user = await this.getUserProfile({ id: authInfo.id });
      if (user) {
        return user;
      }
    }
    throw new UnauthorizedException();
  }


  async create(
    createUserDto: Prisma.UserUncheckedCreateInput,
  ): Promise<UserWithRelations> {
    return this.databaseService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: createUserDto,
        include: UserIncludeOptions,
      });
  
      // Send the welcome email
      await this.mailService.sendMaill(
        user.email,
        'Welcome to Meet to Aspire',
        { greeting: 'Dear ' + user.firstName },
        'welcome-user.hbs',
      );
  
      // Create and send verification token
      await this.createAndSendVerificationToken(user, tx);
  
      return user;
    }, {
      timeout: 20000, // Increase timeout to 20 seconds (or any value that suits your needs)
    });
  }

  async createAndSendVerificationToken(user, dbTransaction: PrismaTransaction = this.databaseService): Promise<void> {
    const now = new Date();
    if (
      user.lastVerificationRequest &&
      now.getTime() - user.lastVerificationRequest.getTime() <
        Utils.minutesToMilliseconds(15)
    ) {
      throw new BadRequestException(
        `You can only request a verification email once every 15 minutes`,
      );
    }
  
    const token: string = uuidv4();
    const tokenExpirationTime = moment()
      .add(Config.verification.TTL, 'minute')
      .format('YYYY-MM-DD HH:mm:ss');
  
    const verificationData = {
      token,
      expiresAt: new Date(tokenExpirationTime),
    };
  
    // Create a new verification token or update any existing
    await dbTransaction.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastVerificationRequest: now,
        verificationToken: {
          upsert: {
            where: { email: user.email },
            create: { ...verificationData, email: user.email },
            update: verificationData,
          },
        },
      },
      include: {
        verificationToken: true,
      },
    });
  
    const [localPart, domainPart] = user.email.split('@');
    const encodedLocalPart = encodeURIComponent(localPart);
    const encodedEmail = `${encodedLocalPart}@${domainPart}`;
    const verificationUrl = `https://${Config.app.customerAppDomain()}/email-verification?token=${token}&email=${encodedEmail}`;
  
    // Payload for email template
    const payload = {
      greeting: 'Dear ' + user.firstName,
      name: user.firstName,
      expiresAt: tokenExpirationTime,
      verificationUrl,
    };
  
    console.log(user.email)
    // Send email outside the transaction
    await this.mailService.sendMaill(
      user.email,
      'Verify Your Account',
      payload,
      'user-email-verification.hbs',
    );
  }
  
  
  async verifyEmail(
    token: string,
    email: string,
  ): Promise<EmailVerificationResponseDto> {
    return this.databaseService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email },
        include: {
          verificationToken: {
            where: { token },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }
      if (user.isVerified) {
        return {
          email,
          isVerified: true,
          duplicateRequest: true,
        };
      }
      const selectedVerificationToken = user.verificationToken[0] ?? null;

      if (
        !selectedVerificationToken ||
        selectedVerificationToken.expiresAt < new Date()
      ) {
        throw new BadRequestException(
          'Verification link is invalid or expired',
        );
      }
      const updatedUser = await this.update(
        user.id,
        {
          isVerified: true,
          verificationToken: {
            deleteMany: {},
          },
        },
        tx,
      );
      return {
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        duplicateRequest: false,
      };
    });
  }


  async resendVerificationEmail(
    email: string,
  ): Promise<EmailVerificationResponseDto> {
    return this.databaseService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email },
        include: UserIncludeOptions,
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isVerified) {
        return {
          email: user.email,
          isVerified: user.isVerified,
        };
      }

      await this.createAndSendVerificationToken(user, tx);
      return {
        email: user.email,
        isVerified: user.isVerified,
      };
    });
  }

  async update(
    id: string,
    updateUserDto: Prisma.UserUncheckedUpdateInput,
    dbTransaction: PrismaTransaction = this.databaseService,
  ) {
    const updatedUser = await dbTransaction.user.update({
      where: { id },
      data: updateUserDto,
      include: UserIncludeOptions,
    });
    return updatedUser
  }

  async findOne(
    whereOptions: Prisma.UserWhereUniqueInput,
    isAuthUserProfile = false
  ) {
    return this.databaseService.$transaction(async (tx) => {
      const includeOptions: Prisma.UserInclude = UserIncludeOptions;

      if (isAuthUserProfile) {
        includeOptions.notifications = {
          where: {
            status: UserNotificationStatus.UNREAD,
          },
        };
      }
      const user = await tx.user.findUnique({
        where: { ...whereOptions, deletedAt: null },
        include: includeOptions,
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      const userProfile = {
        ...user
      }
      if (isAuthUserProfile) {
        Object.assign(userProfile, {
          unreadNotifications: user.notifications
            ? user.notifications.length
            : 0,
        });
      }
      return userProfile  
    });
  }

  async filterAndPaginate(dto: FilterUsersDTO) {
    const authInfo = this.request.user;
    const whereOptions: Prisma.UserWhereInput = { deletedAt: null };
    if (authInfo?.id) {
      whereOptions['NOT'] = { id: authInfo.id };
    }
    if (dto.userType) {
      whereOptions.userType = dto.userType;
    }
    return this.databaseService.$transaction(async (tx) => {
      const totalCount = await tx.user.count({ where: whereOptions });
      let userRecords;
      if (totalCount > 0) {
        userRecords = await tx.user.findMany({
          where: whereOptions,
          include: UserIncludeOptions,
        });
      }

      const resulte = {
        userRecords,
        totalCount,
      }

      return new ValidResponse('Users found', resulte);
    });
  }


  async updateAnyUserType(
    authUser: UserWithRelations,
    userUpdateDto: UserProfileUpdateDto,
  ) {
    const customerUpdateData: Prisma.UserUpdateInput =
    await this.buildCustomerUpdateData(authUser, userUpdateDto);
    return this.databaseService.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: authUser.id },
        data: customerUpdateData,
        include: UserIncludeOptions,
      });
      return updatedUser;
    });
  }

  async buildCustomerUpdateData(
    authUser: User,
    updateUserDto: UserProfileUpdateDto,
  ): Promise<Prisma.UserUncheckedUpdateInput> {
    const {
      phone,
      country,
      state,
      companyName,
      specializations,
      overview,
      periodDuration, 
      profession,
      profilePicture,
      availablePeriod
    } = updateUserDto;
    let { firstName, middleName, lastName } = authUser;
    if (updateUserDto.name) {
      const userNames = Utils.splitFullName(updateUserDto.name);
      firstName = userNames.firstName;
      middleName = userNames.middleName;
      lastName = userNames.lastName;
    }
    return {
      firstName,
      middleName,
      lastName,
      availablePeriod: availablePeriod ?? authUser.availablePeriod,
      profilePicture: profilePicture ?? authUser.profilePicture,
      profession: profession ?? authUser.profession,
      specializations: specializations ?? authUser.specializations,
      overview: overview ?? authUser.overview,
      phone: phone ?? authUser.phone,
      countryId: country ?? authUser.countryId,
      stateId: state ?? authUser.stateId,
      periodDuration: periodDuration ?? authUser.periodDuration,
      companyName: companyName ?? authUser.companyName,
    };
  }


  async changePassword(changePasswordDto: UserChangePasswordDTO) {
    return this.databaseService.$transaction(async (tx) => {
      const authInfo = this.request.user;
      const authUser = await tx.user.findUnique({
        where: { id: authInfo.id, deletedAt: null },
        include: UserIncludeOptions,
      });
      if (!authUser) {
        throw new UnauthorizedException();
      }
      const isMatched = await Utils.hashStringMatch(
        changePasswordDto.currentPassword,
        authUser.password,
      );
      if (!isMatched) {
        throw new BadRequestException('Invalid current password');
      }
      return await this.update(
        authUser.id,
        {
          password: await Utils.hashString(changePasswordDto.password),
        },
        tx,
      );
    });
  }


  async getUserProfile(whereOptions: Prisma.UserWhereUniqueInput) {
    return this.findOne(whereOptions, true);
  }

  async validateUniquePhoneNumber(authUser: User, phoneNumber: string) {
    const existingUser = await this.databaseService.user.findUnique({
      where: { phone: phoneNumber, NOT: { id: authUser.id } },
    });
    if (existingUser) {
      throw new BadRequestException('The phone provided is already in use');
    }
  }
}
