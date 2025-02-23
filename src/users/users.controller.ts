import { BadRequestException, Body, Controller, Inject, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EmailVerificationResponseDto } from 'src/common-modules/common-dto/email-verification-response.dto';
import { VerifyEmailDto } from 'src/common-modules/common-dto/verify-email.dto';
import { PublicAccess } from 'src/helper/decorators/public-access.decorator';
import { isValidToken } from 'src/helper/token-validator';
import { ValidResponse } from 'src/helper/valid-response';
import { UsersService } from './users.service';
import { ResendVerificationEmailDto } from 'src/common-modules/common-dto/resend-verification-email.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOkResponse()
  @Post()
  async getUserTypes() {
    return "Hello User"
  }

  @PublicAccess()
  @Post('verify-email')
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<ValidResponse<EmailVerificationResponseDto>> {
    const { token, email } = verifyEmailDto;

    if (!isValidToken(token)) {
      throw new BadRequestException('Invalid token format');
    }

    return new ValidResponse(
      'Your email address has been verified',
      await this.usersService.verifyEmail(token, email),
    );
  }

  @PublicAccess()
  @Post('resend-verification-email')
  @ApiBody({ type: ResendVerificationEmailDto })
  async resendVerificationEmail(
    @Body() resendVerificationEmailDto: ResendVerificationEmailDto,
  ): Promise<ValidResponse<EmailVerificationResponseDto>> {
    const { email } = resendVerificationEmailDto;

    if (!email) {
      throw new UnauthorizedException('Email must be provided');
    }
    return new ValidResponse(
      'Verification email sent successfully',
      await this.usersService.resendVerificationEmail(email),
    );
  }
}
