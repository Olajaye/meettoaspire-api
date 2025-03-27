import { City, Country, State } from '@prisma/client';


export class CountryDto {
  id: number;
  name: string;
  code: string;
  phonePrefix: string | null;
  currencyName: string | null;
  currencySymbol: string | null;
  constructor(country: Country) {
    this.id = country.id;
    this.name = country.name;
    this.code = country.code;
    this.phonePrefix = country.phonePrefix;
    this.currencyName = country.currencyName;
    this.currencySymbol = country.currencySymbol;
  }
}

export class StateDto {
  id: number;
  name: string;
  countryId: number;
  constructor(state: State) {
    this.id = state.id;
    this.name = state.name;
    this.countryId = state.countryId;
  }
}

export class CityDto {
  id: number;
  name: string;
  stateId: number;
  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
    this.stateId = city.stateId;
  }
}



