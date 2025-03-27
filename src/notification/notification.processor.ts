// src/notification/notification.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { FirestoreService } from '../database/firestore/firestore.service';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';


@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private readonly firestoreService: FirestoreService,
    private logger: CustomLoggerService,
  ) {}

  @Process('sendNotification')
  async handleSendNotification(job: Job) {
    const { messagingPayload } = job.data;
    this.logger.debug(`Processing job ${job.id} with data:`, job.data);
    await this.firestoreService.sendPushNotification(messagingPayload);
  }
}
