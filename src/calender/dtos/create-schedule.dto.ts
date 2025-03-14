import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from 'class-transformer';
import { $Enums, SessionType } from "@prisma/client";

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  sessionRefrences: string

  @ApiProperty()
  @IsString()
  bookingId: string

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  aspirantId: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsDateString({}, { message: 'Date must be a valid date' })
  date: Date
   

  @ApiProperty()
  @IsString()
  time: string


  @IsEnum(SessionType) 
  @Type(() => String)
  type: $Enums.SessionType
}

export class ExpertScheduleDto {
  @ApiProperty()
  @IsString()
  expertId: string
}