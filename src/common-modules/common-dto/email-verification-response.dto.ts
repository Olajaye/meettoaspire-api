import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailVerificationResponseDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional()
  duplicateRequest?: boolean;
}
