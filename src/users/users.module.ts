import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  providers: [MailService, UsersService,  DatabaseService],
  controllers: [UsersController]
})
export class UsersModule {}
