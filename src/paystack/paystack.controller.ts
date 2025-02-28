import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaystackService } from './paystack.service';
import { InitializePaymentDTO } from './dtos/initializePayment.dto';
import { ValidResponse } from 'src/helper/valid-response';
import { PaystackCallbackDto } from './dtos/callback.dto';


@ApiTags('Paystack Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('paystack-transactions')
export class PaystackController {
  constructor(
    private readonly paystackService: PaystackService,  
  ) {}

  @Post('/initialize')
  async initializeTransaction(@Body() initializePaymentDTO: InitializePaymentDTO,) {
    const payment = await this.paystackService.initializeTransaction(initializePaymentDTO);
    return new ValidResponse("Procceed with payment", payment);
  }


  @Post('/callback')
  async verifyTransaction(@Body() callback: PaystackCallbackDto) {
    return await this.paystackService.verifyTransaction(callback);
  }

}
