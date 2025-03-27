import { $Enums } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';
import { isUnique } from '../../helper/decorators/is-unique.decorator';

export class UserSignupRequestDto {
  @ApiProperty()
  @IsDefined({message: 'The name field is required'})
  name: string;

  @ApiProperty()
  @IsDefined({message: 'The email field is required'})
  @IsEmail()
  @isUnique({ entity: 'user', column: 'email' })
  email: string;

  @ApiProperty({ example: '+2349034903303' })
  @IsDefined({message: 'The phone field is required'})
  @IsPhoneNumber()
  @isUnique({ entity: 'user', column: 'phone' })
  phone: string;

  @ApiProperty()
  @ApiProperty({ enum: $Enums.UserType })
  @IsEnum($Enums.UserType)
  userType: $Enums.UserType;

  @ApiProperty()
  @IsOptional()
  companyName?:string 

  @ApiProperty()
  @IsOptional()
  profession?:string 

  @ApiProperty()
  @IsNotEmpty({ message: 'The country field is required' })
  country: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'The state field is required' })
  state: number;


  @ApiProperty()
  @IsDefined({message: 'The password field is required'})
  @MinLength(8)
  password: string;

  // @ApiProperty({ enum: $Enums.IdentificationType })
  // @IsEnum($Enums.IdentificationType)
  // @IsOptional()
  // idType?: $Enums.IdentificationType;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsOptional()
  // idNumber?: string;
}
