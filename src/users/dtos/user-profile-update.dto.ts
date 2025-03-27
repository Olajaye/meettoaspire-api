import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { IsImage } from '../../helper/decorators/is-image.decorator'; 

export class UserProfileUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '+2349034903303' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  profession?:string 

  @ApiPropertyOptional()
  @IsOptional()
  @IsImage()
  profilePicture?: string;

  @ApiProperty({ example: 161 })
  @IsDefined({ message: 'The country field is required' })
  @IsNumber()
  country: number;

  @ApiProperty({ example: 306 })
  @IsDefined({ message: 'The state field is required' })
  @IsNumber()
  state: number;

  @ApiPropertyOptional({ example: 'Flex Media' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  specializations?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  overview: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  periodDuration:string
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  availablePeriod: string
}
