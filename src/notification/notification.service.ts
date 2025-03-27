import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { DatabaseService } from '../database/database.service';
import { FilterNotificationsDTO } from './dto/filter-notification.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Prisma, UserNotification } from '@prisma/client';
import { getActionLink, NotificationDTO } from './dto/notification.dto';
import { PrismaTransaction } from '../helper/custom-types';
import { UUID } from 'crypto';
import { RegisterDeviceTokenDTO } from './dto/register-device-token.dto';
import * as moment from 'moment';
import { CreateNotificationPayload } from './dto/create-notification.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';


@Injectable()
export class NotificationService {
  constructor(
    private databaseService: DatabaseService,
    private logger: CustomLoggerService,
    @Inject(REQUEST) private readonly request: Request,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async storeDeviceToken(dto: RegisterDeviceTokenDTO) {
    const authInfo = this.request.user;
    return this.databaseService.userDeviceToken.create({
      data: {
        userId: authInfo.id,
        token: dto.token,
        expiresAt: moment().add(2, 'month').toDate(),
      },
    });
  }

  async addNotificationJob(
    deviceToken: string,
    userNotification: UserNotification,
  ) {
    const pushNotification: TokenMessage = {
      token: deviceToken,
      notification: {
        title: userNotification.title,
        body: userNotification.body,
      },
      data: {
        tag: userNotification.tag,
        link: getActionLink(userNotification) ?? '',
      },
    };
    this.logger.debug('Creating push notification', pushNotification);
    await this.notificationQueue
      .add('sendNotification', {
        messagingPayload: pushNotification,
      })
      .then((fulfilled) =>
        this.logger.debug('Notification added to queue', { fulfilled }),
      );
  }

  async create(
    createNotificationDto: CreateNotificationPayload,
    tx: PrismaTransaction = this.databaseService,
  ) {
    const userNotification = await tx.userNotification.create({
      data: {
        userId: createNotificationDto.userId,
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        tag: createNotificationDto.tag,
        metadata: {
          deviceToken: createNotificationDto.deviceToken,
        },
      },
    });

    if (createNotificationDto.deviceToken) {
      await this.addNotificationJob(
        createNotificationDto.deviceToken,
        userNotification,
      );
    }
    return userNotification;
  }

  async filterAndPaginate(dto: FilterNotificationsDTO) {
    const take = dto.recordsPerPage ?? 20;
    const currentPage = dto.page ?? 1;
    const skip = take * (currentPage - 1);
    const sortBy = 'createdAt';
    const sortDirection: Prisma.SortOrder = dto.orderDirection ?? 'desc';
    const authInfo = this.request.user;
    const whereOptions: Prisma.UserNotificationWhereInput = {
      userId: authInfo.id,
    };

    if (dto.status) {
      whereOptions['status'] = dto.status;
    }
    return this.databaseService.$transaction(async (tx) => {
      const totalCount = await tx.userNotification.count({
        where: whereOptions,
      });
      const findManyOptions: Prisma.UserNotificationFindManyArgs = {
        take,
        skip,
        where: whereOptions,
        orderBy: {
          [sortBy]: sortDirection,
        },
      };
      if (dto.lastNotificationId) {
        findManyOptions['skip'] = 1;
        findManyOptions['cursor'] = { id: dto.lastNotificationId };
      }

      let userNotifications: UserNotification[] = [];
      if (totalCount > 0) {
        userNotifications = await this.findMany(findManyOptions, tx);
      }
      return {
        data: userNotifications.map((userNotification) => {
          return new NotificationDTO(userNotification);
        }),
        totalCount,
        currentPage,
        totalPages: totalCount == 0 ? 0 : Math.ceil(totalCount / take),
      };
    });
  }

  async findMany(
    findManyOptions: Prisma.UserNotificationFindManyArgs,
    tx: PrismaTransaction = this.databaseService,
  ) {
    return tx.userNotification.findMany(findManyOptions);
  }

  async findOne(whereOptions: Prisma.UserNotificationWhereInput) {
    const authInfo = this.request.user;
    const where = {
      userId: authInfo.id,
      ...whereOptions,
    };
    return this.databaseService.userNotification.findFirst({ where });
  }

  async update(id: UUID, updateNotificationDto: UpdateNotificationDto) {
    const authInfo = this.request.user;
    if (!authInfo.id) {
      throw new UnauthorizedException();
    }
    return this.databaseService.userNotification.update({
      where: { id, userId: authInfo.id },
      data: updateNotificationDto,
    });
  }

  async remove(whereOption: Prisma.UserNotificationWhereInput) {
    const authInfo = this.request.user;
    return this.databaseService.userNotification.deleteMany({
      where: {
        ...whereOption,
        userId: authInfo.id,
      },
    });
  }
}
