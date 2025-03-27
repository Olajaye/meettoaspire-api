import { NotificationTag } from '../../helper/enums/notification-tags.enum';

export class CreateNotificationPayload {
  tag: NotificationTag;

  userId: string;

  deviceToken?: string;

  title: string;

  body: string;

  additionalData?: object;

  link: string;
}
