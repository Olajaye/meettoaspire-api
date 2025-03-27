import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDeviceTokenDTO {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
