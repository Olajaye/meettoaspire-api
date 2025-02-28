import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { $Enums, Prisma, UserType } from '@prisma/client';

export class FilterUsersDTO {
  @ApiPropertyOptional({ enumName: 'UserType',  enum: $Enums.UserType })
  @IsOptional()
  @IsEnum(UserType)
  @Type(() => String)
  userType: $Enums.UserType;
}
