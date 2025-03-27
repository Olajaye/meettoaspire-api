import { ApiProperty } from "@nestjs/swagger";
import Utils from "../../helper/utils";
import { IsDefined, IsEmail, IsNotEmpty, NotEquals } from "class-validator";
import { exists } from "../../helper/decorators/exists.decorator";


const defaultLoginErrorMessage = Utils.isDebugMode()
  ? undefined
  : { message: 'Invalid credentials' };
  
export class UserSigninDto {
  @ApiProperty({example: 'sampleuser@example.com'})
  @IsDefined({ message: 'The email field is required' })
  @IsEmail({}, { message: 'The email provided is invalid' })
  // @exists({ entity: 'user', column: 'email' }, defaultLoginErrorMessage)
  email: string;

  @ApiProperty({example: 'password'})
  @IsDefined({ message: 'The password field is required' })
  password: string;
}
