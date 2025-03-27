import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { BullModule } from '@nestjs/bull';
import { NotificationProcessor } from './notification.processor';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';


@Module({
  controllers: [NotificationController],
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationService, NotificationProcessor, CustomLoggerService],
})
export class NotificationModule {}
