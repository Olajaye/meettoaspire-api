import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';
import { HttpService } from '@nestjs/axios';
import { Provider } from '@nestjs/common';
import axios from 'axios';

// Define the token
export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN';

// Create the provider for Axios
export const axiosProvider: Provider = {
  provide: AXIOS_INSTANCE_TOKEN,
  useValue: axios,  // This could also be a configured Axios instance if needed
};

@Module({
  providers: [MailService, UsersService, DatabaseService, HttpService,  axiosProvider],
  controllers: [UsersController],
  exports: [axiosProvider],
})
export class UsersModule {}
