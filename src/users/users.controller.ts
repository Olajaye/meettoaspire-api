import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, ParseUUIDPipe, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
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
import { OptionalAuth } from 'src/helper/decorators/optional-auth-guard.decorator';
import { UserProfileDto } from 'src/common-modules/common-dto/user-profile.dto';
import { UUID } from 'crypto';
import { FilterUsersDTO } from './dtos/filterUser.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @OptionalAuth()
  @PublicAccess()
  @Get()
  async findAll(@Query() dto: FilterUsersDTO) {
    return await this.usersService.filterAndPaginate(dto);
  }

  @OptionalAuth()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<ValidResponse<UserProfileDto>> {
    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data = new UserProfileDto(user);
    return  new ValidResponse('User found', data);
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
