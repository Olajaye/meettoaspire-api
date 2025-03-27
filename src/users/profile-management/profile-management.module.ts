import { Module, Provider } from '@nestjs/common';
import { ProfileManagementController } from './profile-management.controller';
import { UsersService } from '../users.service';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';
// Define the token
export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN';

// Create the provider for Axios
export const axiosProvider: Provider = {
  provide: AXIOS_INSTANCE_TOKEN,
  useValue: axios,  // This could also be a configured Axios instance if needed
};

@Module({
  controllers: [ProfileManagementController],
  providers: [UsersService, DatabaseService, MailService, HttpService, CustomLoggerService, axiosProvider]
})
export class ProfileManagementModule {}
