import { UserNotification } from '@prisma/client';
import { NotificationTag } from '../../helper/enums/notification-tags.enum';
// import Config from '../../helper/config';

export class NotificationDTO {
  id: string;

  title: string;

  body: string;

  link?: string | null;

  read: boolean;

  createdAt: Date;

  constructor(userNotification: UserNotification) {
    this.id = userNotification.id;
    this.title = userNotification.title;
    this.body = userNotification.body;
    this.link = getActionLink(userNotification);
    this.read = userNotification.status == 'READ';
    this.createdAt = userNotification.createdAt;
  }
}

export const getActionLink = (
  notification: UserNotification,
): string | null => {
  const notificationTag = notification.tag;
  // const baseUrl = 'https://' + Config.app.customerAppDomain();
  let notificationLink: string | null;
  switch (notificationTag) {
    case NotificationTag.ASPIRANT_BOOKING_SESSION:
      notificationLink = '/calender';
      break;

   
      break;

    default:
      notificationLink = notification.link;
      break;
  }
  return notificationLink;
};
