import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { PrismaTransaction, UserIncludeOptions, UserWithRelations } from 'src/helper/custom-types';
import Utils from 'src/helper/utils';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import Config from 'src/helper/config';
import { UserSignupRequestDto } from 'src/auth/dto/user-signup-request.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

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

    console.log(payload)

    // await this.mailService.sendMail(
    //   user.email,
    //   'Verify Your Account',
    //   payload,
    //   'user-email-verification.hbs',
    // );
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


  async create(
    createUserDto: Prisma.UserUncheckedCreateInput,
  ): Promise<UserWithRelations> {
    return this.databaseService.$transaction(async (tx) => {
      const user = await this.databaseService.user.create({
        data: createUserDto,
        include: UserIncludeOptions,
      });
      // TODO ::  Send the welcome email via a queued job.
      // await this.mailService.sendMail(
      //   userWithRating.email, 'Welcome to Eyrie & Obra', {greeting: "Dear " + userWithRating.firstName}, 'welcome-user.hbs'
      // );
      await this.createAndSendVerificationToken(user);

      return user;
    });
  }


  async getUserProfile(whereOptions: Prisma.UserWhereUniqueInput) {
    return this.findOne(whereOptions, true);
  }
}
