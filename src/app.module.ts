import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    DatabaseModule, 
    DataAccessorModule, 
    AuthModule, 
    UsersModule,
    CustomLoggerModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
