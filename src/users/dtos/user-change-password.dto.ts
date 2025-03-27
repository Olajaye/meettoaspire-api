import { ApiProperty } from "@nestjs/swagger";
import { IsString, ValidateIf } from "class-validator";

export class UserChangePasswordDTO {
    @ApiProperty()
    @IsString()
    currentPassword: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    @ValidateIf((req) => req.password !== req.passwordConfirmation, {
        message: 'The password and confirmation values do not match',
    })
    passwordConfirmation: string;
}