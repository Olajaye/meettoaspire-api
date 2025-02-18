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
  industry: string | null;
  profilePicture: string | null;
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

  constructor(user: UserWithRelations ) {
    const userDetails = _.pick(user, [
      'id',
      'city',
      'country',
      'createdAt',
      'email',
      'companyName',
      'isActive',
      'isVerified',
      'newsletterOptIn',
      'industry',
      'phone',
      'profilePicture',
      'state',
      'userType',
    ]);

    // 3. Combine user details, name (from separate function: getUserFullName), and company details
    _.assign(userDetails, {name: getUserFullName(user) });
    // 4. Sort the result just because
    _.assign(this, Utils.sortObjectByKeys(userDetails));
    console.log(userDetails)
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



// type WithUser<T extends PropertyResponseDto> = T & {
//   user?: UserProfileDto; // Optional user property
// };