import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserSignupRequestDto } from './dto/user-signup-request.dto';
import { AuthService } from './auth.service';
import { ValidResponse } from 'src/helper/valid-response';
import { UserProfileDto } from '../common-modules/common-dto/user-profile.dto';
import { UserSigninResponseDto } from './dto/user-responces.dto';
import { InValidResponse } from 'src/helper/Invalid-response';
import { UserSigninDto } from './dto/user-signin.dto';


@ApiTags('Users - Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({
    type: UserSigninResponseDto 
  })
  @Post('signup')
  async getUserTypes(@Body() createUserDto: UserSignupRequestDto) {
    const createdUser = await this.authService.signup(createUserDto);
    const accessToken = this.authService.generateAccessToken(createdUser);
    return new ValidResponse('Signup Successful',  {
      accessToken,
      user: new UserProfileDto(createdUser),
    })
  }



  @ApiOkResponse({
    type: UserSigninResponseDto,
  })
  @Post('login')
  async signin(
    @Body() userSigninDto: UserSigninDto,
  ): Promise<ValidResponse<UserSigninResponseDto>> {
    return new ValidResponse(
      'Successful',
      await this.authService.signin(userSigninDto),
    );
  }
}
