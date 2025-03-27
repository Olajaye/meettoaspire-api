import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DataAccessRequestDTO } from './dto/data-access-request.dto';
import { DataAccessDTO } from './dto/data-access.dto';

@Injectable()
export class DataAccessorService {
  constructor(private readonly databaseService: DatabaseService) {};

  async getEnumsAndTableData( requestOptions: DataAccessRequestDTO): Promise<DataAccessDTO> {
    this.validateDataAccessRequest(requestOptions);

    const result: DataAccessDTO = {};

    return this.databaseService.$transaction(async (tx) => {
      if (requestOptions.countries) {
        result.countries = await tx.country.findMany({
          select: {
            id: true,
            name: true,
            code: true,
            phonePrefix: true,
            currencyName: true,
            currencySymbol: true,
          },
        });
      }
      if (requestOptions.states) {
        result.states = await tx.state.findMany({
          select: { id: true, name: true, countryId: true },
          where: { countryId: requestOptions.countryId },
        });
      }
      if (requestOptions.cities) {
        result.cities = await tx.city.findMany({
          select: { id: true, name: true, stateId: true },
          where: { stateId: requestOptions.stateId},
        });
      }
     
      if (requestOptions.currencyCountries) {
        result.currencyCountries = await tx.country.findMany({
          distinct: ['currencyName'],
          select: {
            id: true,
            name: true,
            code: true,
            phonePrefix: true,
            currencyName: true,
            currencySymbol: true,
          },
        });
      }
      return result;
    });
  }



  validateDataAccessRequest(requestOptions: DataAccessRequestDTO) {
    if (requestOptions.states && !requestOptions.countryId) {
      throw new BadRequestException(
        'countryId is required to fetch states records',
      );
    }
    if (requestOptions.cities && !requestOptions.stateId) {
      throw new BadRequestException(
        'stateId is required to fetch cities records',
      );
    }
  }
}


