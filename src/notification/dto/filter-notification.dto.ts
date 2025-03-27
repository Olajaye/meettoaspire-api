import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma, UserNotificationStatus } from '@prisma/client';
import { UUID } from 'crypto';

export class FilterNotificationsDTO {
  @ApiPropertyOptional({ enum: UserNotificationStatus })
  @IsOptional()
  @IsEnum(UserNotificationStatus)
  status?: UserNotificationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({
    description: `This is set to the DESC by default`,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: Prisma.SortOrder;

  @ApiPropertyOptional({ description: 'This is set to a default value of 20' })
  @IsOptional()
  @Min(1, { message: 'Records per page must be greater that 0' })
  @Max(100, { message: 'Records per page must not exceed 100' })
  @Type(() => Number)
  recordsPerPage?: number;

  @ApiPropertyOptional({
    description: 'The current pagination page. It is set to 1 by default',
  })
  @IsOptional()
  @Min(1, { message: 'Page number must be greater than 0' })
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description:
      "The id of the last notification in the previous query: This should be used when using the 'show more' method of pagination",
  })
  @IsOptional()
  @IsUUID()
  lastNotificationId?: UUID;
}