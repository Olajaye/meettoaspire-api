import { UserProfileDto } from "../../common-modules/common-dto/user-profile.dto";

export class UserSigninResponseDto {
  accessToken: string;
  user: UserProfileDto
}