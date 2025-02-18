import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DataAccessRequestDTO {

  @ApiProperty()
  @IsOptional()
  countries?: boolean;

  @ApiProperty()
  @IsOptional()
  states?: boolean;

  @ApiProperty()
  @IsOptional()
  cities?: boolean;

  @ApiProperty({example: '161'})
  @IsOptional()
  countryId?: number;

  @ApiProperty()
  @IsOptional()
  stateId?: number;

  @ApiProperty()
  @IsOptional()
  currencyCountries?: boolean;

}
