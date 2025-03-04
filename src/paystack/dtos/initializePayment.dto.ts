import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEmail, IsString } from "class-validator";

export class InitializePaymentDTO {
    @ApiProperty()
    @IsString()
    aspirantname: string;

    @ApiProperty({example: 'sampleuser@example.com'})
    @IsDefined({ message: 'The email field is required' })
    @IsEmail({}, { message: 'The email provided is invalid' })
    expertemail: string;

    @ApiProperty({
        description: 'The amount of the payment',
        default: 500000, 
    })
    @IsDefined({ message: 'The amount field is required' })
    amount: number;

}


