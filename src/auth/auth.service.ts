import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { UserSignupRequestDto } from './dto/user-signup-request.dto';
import Utils from 'src/helper/utils';
import { MonoService } from 'src/common-modules/mono/mono.service';
import { $Enums, User } from '@prisma/client';
import Config from 'src/helper/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserSigninDto } from './dto/user-signin.dto';
import { UserProfileDto } from 'src/common-modules/common-dto/user-profile.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersServices: UsersService,
    private readonly monoService: MonoService,
    @Inject(REQUEST) private readonly request: Request,
    private jwt: JwtService,
  ) {}

  async signup(
    createUserDto: UserSignupRequestDto,
  ) {
   try {
    const userNames = this.splitFullName(createUserDto.name);
    const hashedPassword = await Utils.hashString(createUserDto.password);
    const { email, phone, userType, country, state, city, companyName } = createUserDto;

    let identityValidationResponse;

    if(createUserDto.userType === $Enums.UserType.EXPERT && createUserDto.idType && createUserDto.idNumber){
      identityValidationResponse = await this.monoService.verifyIdentity(
        createUserDto.idType,
        createUserDto.idNumber,
        {
          firstName:userNames.firstName,
          lastName: userNames.lastName,
        },
      );
    }

    if(createUserDto.userType === $Enums.UserType.EXPERT && identityValidationResponse.data.status === "failed"){
      console.log("run data")
      return false
    }else{
      const userData = {
        email,
        phone,
        userType,
        companyName,
        countryId: country,
        stateId: state,
        cityId: city,
        password: hashedPassword,
        ...userNames,
      };
      return await this.usersServices.create(userData);
    }

    
    
   } catch (error) {
    return error
   }
  }

  async signin(userSigninDto: UserSigninDto) {
    const user = await this.usersServices.getUserProfile({
      email: userSigninDto.email,
    });
    console.log(user)
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    // The compare password method throws a bad request exception if the password is not valid
    await this.comparePassword(userSigninDto.password, user.password);

    return {
      accessToken: this.generateAccessToken(user),
      user: new UserProfileDto(user),
    };
  }


  async comparePassword(enteredPassword: string, storedHash: string) {
    const isMatched = await bcrypt.compare(enteredPassword, storedHash);
    if (!isMatched) {
      throw new BadRequestException('Invalid password');
    }
  }

  generateAccessToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.id,
      expiresIn: Config.jwt.expiresIn(),
    };
    return this.jwt.sign(payload);
  }

  splitFullName(fullName: string): {
    firstName: string;
    middleName: string;
    lastName: string;
  } {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts.shift() ?? '';
    const lastName = parts.pop() ?? '';
    const middleName = parts.join(' ');
    return {
      firstName,
      middleName,
      lastName,
    };
  }
}
