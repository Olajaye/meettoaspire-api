import { Module, Provider } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DataAccessorModule } from './common-modules/data-accessor/data-accessor.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomLoggerModule } from './common-modules/custom-logger/custom-logger.module';
import { join } from 'path';
import Config from './helper/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ProfileManagementModule } from './users/profile-management/profile-management.module';
import axios from 'axios';
import { UsersService } from './users/users.service';
import { MailService } from './mail/mail.service';
import { DatabaseService } from './database/database.service';
import { HttpService } from '@nestjs/axios';
import { PaystackService } from './paystack/paystack.service';
import { PaystackController } from './paystack/paystack.controller';
import { PaystackModule } from './paystack/paystack.module';
import { CalenderController } from './calender/calender.controller';
import { CalenderService } from './calender/calender.service';
import { CalenderModule } from './calender/calender.module';
import { BullModule } from '@nestjs/bull';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN';
export const axiosProvider: Provider = {
  provide: AXIOS_INSTANCE_TOKEN,
  useValue: axios,  // This could also be a configured Axios instance if needed
};

@Module({
  imports: [
    DatabaseModule, 
    DataAccessorModule, 
    AuthModule, 
    UsersModule,
    CustomLoggerModule,
    NotificationModule,
    BullModule.registerQueue({
          name: 'notifications',
        }),
    MailerModule.forRoot({
      transport: Config.mail(),
      defaults: {
        from: '"No Reply" <' + Config.app.mailFromAddress() + '>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      options: {
        partials: {
          dir: join(__dirname, 'templates', 'partials'),
          options: {
            strict: true,
          },
        },
      },
    }),
    ProfileManagementModule,
    PaystackModule,
    CalenderModule,
  ],
  controllers: [AppController, PaystackController, CalenderController],
  providers: [
    AppService, 
    MailService, 
    UsersService, 
    DatabaseService,
    HttpService,  
    axiosProvider, PaystackService, CalenderService, NotificationService],
})
export class AppModule {}
