import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { JwtStrategy } from './jwt-auth.strategy';
import Config from 'src/helper/config';
import { MailService } from 'src/mail/mail.service';

@Module({
  providers: [MailService, AuthService, UsersService, DatabaseService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_CLIENT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    HttpModule
  ]
})
export class AuthModule {}
