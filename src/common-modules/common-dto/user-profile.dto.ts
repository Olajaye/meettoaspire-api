import UserType from '../../helper/enums/user_types.enum';

import { UserWithRelations } from '../../helper/custom-types';
import { ApiProperty } from '@nestjs/swagger';
import * as _ from 'lodash';
import {
  CityDto,
  CountryDto,
  StateDto,
} from '../../common-modules/common-dto/common-dto';
import Utils from '../../helper/utils';


export class UserProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  companyName: string| null;
  profession: string | null;
  specializations: string[] | null;
  availablePeriod: string | null;
  profilePicture: string | null;
  periodDuration: string | null;           
  overview: string | null;  
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  newsletterOptIn: boolean;
  @ApiProperty({ type: () => CountryDto })
  country: CountryDto | null;
  @ApiProperty({ type: () => StateDto })
  state: StateDto | null;
  @ApiProperty({ type: () => CityDto })
  city: CityDto | null;
  unreadNotifications?: number;

  constructor(
    user: UserWithRelations & 
     {unreadNotifications?: number}, 
    ) {
    const userDetails = _.pick(user, [
      'id',
      'city',
      'country',
      'createdAt',
      'email',
      'companyName',
      'specializations',
      'availablePeriod',  
      'periodDuration',
      'overview',
      'isActive',
      'isVerified',
      'newsletterOptIn',
      'profession',
      'phone',
      'profilePicture',
      'state',
      'userType',
    ]);

    if (user.unreadNotifications != undefined) {
      Object.assign(userDetails, {
        unreadNotifications: user.unreadNotifications,
      });
    }

    // 3. Combine user details, name (from separate function: getUserFullName), and company details
    _.assign(userDetails, {name: getUserFullName(user) });
    // 4. Sort the result just because
    _.assign(this, Utils.sortObjectByKeys(userDetails));
  }

 
}

export const getUserFullName = (
  user: Required<{
    firstName: string;
    middleName?: string | null;
    lastName: string;
  }>,
): string => {
  const { firstName, middleName, lastName } = user;
  const middle = middleName ? ` ${middleName}` : '';
  return `${firstName}${middle} ${lastName}`;
};

