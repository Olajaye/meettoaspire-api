import { ApiProperty } from '@nestjs/swagger';
import {
  CityDto,
  CountryDto,
  StateDto,
} from '../../common-dto/common-dto';



export class DataAccessDTO {
  countries?: CountryDto[];
  states?: StateDto[];
  cities?: CityDto[];
  currencyCountries?: CountryDto[];
}
