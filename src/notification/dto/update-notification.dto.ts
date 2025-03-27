import { UserNotificationStatus } from '@prisma/client';

export class UpdateNotificationDto {
  status: UserNotificationStatus;
}
