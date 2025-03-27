import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
    imports: [
      BullModule.registerQueue({
        name: 'notifications',
      }),
    ],
   providers: [
      NotificationService,
      CustomLoggerService,
    ],
})
export class CalenderModule {}
