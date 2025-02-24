import { MailService } from './../mail/mail.service';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { PrismaTransaction, UserIncludeOptions, UserWithRelations } from 'src/helper/custom-types';
import Utils from 'src/helper/utils';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import Config from 'src/helper/config';
import { EmailVerificationResponseDto } from 'src/common-modules/common-dto/email-verification-response.dto';


@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  // async create(
  //   createUserDto: Prisma.UserUncheckedCreateInput,
  // ): Promise<UserWithRelations> {
  //   return this.databaseService.$transaction(async (tx) => {
  //     const user = await this.databaseService.user.create({
  //       data: createUserDto,
  //       include: UserIncludeOptions,
  //     });
  //     // TODO ::  Send the welcome email via a queued job.
  //     await this.mailService.sendMail(
  //       user.email, 'Welcome to Meet to Aspire', {greeting: "Dear " + user.firstName}, 'welcome-user.hbs'
  //     );
  //     await this.createAndSendVerificationToken(user);
  //     return user;
  //   });
  // }

  async create(
    createUserDto: Prisma.UserUncheckedCreateInput,
  ): Promise<UserWithRelations> {
    return this.databaseService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: createUserDto,
        include: UserIncludeOptions,
      });
  
      // Send the welcome email
      await this.mailService.sendMail(
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


  // async createAndSendVerificationToken(user, dbTransaction: PrismaTransaction = this.databaseService): Promise<void> {
  //   const now = new Date();
  //   if (
  //     user.lastVerificationRequest &&
  //     now.getTime() - user.lastVerificationRequest.getTime() <
  //       Utils.minutesToMilliseconds(15)
  //   ) {
  //     throw new BadRequestException(
  //       `You can only request a verification email once every 15 minutes`,
  //     );
  //   }

  //   const token: string = uuidv4();
  //   const tokenExpirationTime = moment()
  //     .add(Config.verification.TTL, 'minute')
  //     .format('YYYY-MM-DD HH:mm:ss');
      
  //   const verificationData = {
  //     token,
  //     expiresAt: new Date(tokenExpirationTime),
  //   };

  //   // Create a new verification token or update any existing
  //   await dbTransaction.user.update({
  //     where: {
  //       id: user.id,
  //     },
  //     data: {
  //       lastVerificationRequest: now,
  //       verificationToken: {
  //         upsert: {
  //           where: { email: user.email },
  //           create: { ...verificationData, email: user.email },
  //           update: verificationData,
  //         },
  //       },
  //     },
  //     include: {
  //       verificationToken: true,
  //     },
  //   });
    
  //   const [localPart, domainPart] = user.email.split('@');
  //   const encodedLocalPart = encodeURIComponent(localPart);
  //   const encodedEmail = `${encodedLocalPart}@${domainPart}`;
  //   const verificationUrl = `http://${Config.app.customerAppDomain()}/email-verification?token=${token}&email=${encodedEmail}`;
   

  //   // Payload for email template
  //   const payload = {
  //     greeting: 'Dear ' + user.firstName,
  //     name: user.firstName,
  //     expiresAt: tokenExpirationTime,
  //     verificationUrl,
  //   };

    
  //   await this.mailService.sendMail(
  //     user.email,
  //     'Verify Your Account',
  //     payload,
  //     'user-email-verification.hbs',
  //   );   
  // }
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
    isAuthUserProfile = false,
  ) {
    return this.databaseService.$transaction(async (tx) => {
      const authInfo = this.request.user;
      console.log(authInfo)
      const includeOptions: Prisma.UserInclude = UserIncludeOptions;
      

      const user = await tx.user.findUnique({
        where: { ...whereOptions, deletedAt: null },
        include: includeOptions,
      });

      if (!user) {
        return null;
      }

      return user 
    
    });
  }



  async getUserProfile(whereOptions: Prisma.UserWhereUniqueInput) {
    return this.findOne(whereOptions, true);
  }
}
