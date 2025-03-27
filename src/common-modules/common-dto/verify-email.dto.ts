import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string;
}
