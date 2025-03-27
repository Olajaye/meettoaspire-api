import { Prisma, User } from '@prisma/client';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { InitializePaymentDTO } from './dtos/initializePayment.dto';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { PaymentStatus, PaystackCreateTransactionResponseDto, PaystackMetadata, PaystackVerifyTransactionResponseDto } from 'src/helper/types/paystack';
import { DatabaseService } from 'src/database/database.service';
import { PaystackCallbackDto } from './dtos/callback.dto';
import { UUID } from 'crypto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationTag } from 'src/helper/enums/notification-tags.enum';

@Injectable()
export class PaystackService {
  constructor(
    private readonly usersService: UsersService,
    private readonly databaseService: DatabaseService,
    private notificationService: NotificationService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async getUserTarncation(id:UUID){
    return await this.databaseService.bookingSession.findMany({
      where: {
        UserId: id
      }
    })
  }

  // async getUserTransaction(id: UUID, page: number = 1, limit: number = 10) {
  //   const skip = (page - 1) * limit;
  
  //   const [transactions, total] = await Promise.all([
  //     this.databaseService.bookingSession.findMany({
  //       where: { UserId: id },
  //       skip,
  //       take: limit,
  //       orderBy: { createdAt: 'desc' } // Added sorting
  //     }),
  //     this.databaseService.bookingSession.count({
  //       where: { UserId: id }
  //     })
  //   ]);
  
  //   return {
  //     data: transactions,
  //     meta: {
  //       total,
  //       page,
  //       totalPages: Math.ceil(total / limit),
  //       limit
  //     }
  //   };
  // }

  // async getExpertBookedSession(id:UUID){
  //   return await this.databaseService.bookingSession.findMany({
  //     where: {
  //       expertID: id,
  //       status: PaymentStatus.paid
  //     },
  //     include:{
  //       User: {
  //         select:{
  //           firstName:true,
  //           lastName: true,
  //           middleName:true,
  //           profilePicture: true,
  //           overview: true,
  //           profession: true
  //         }
  //       },
  //       scheduleSession:{
  //         select:{
  //           date:true,
  //           time:true
  //         }
  //       }      
  //     }
  //   })
  // }


  async getExpertBookedSession(id: UUID, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      this.databaseService.bookingSession.findMany({
        where: {
          expertID: id,
          status: PaymentStatus.paid
        },
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              profilePicture: true,
              overview: true,
              profession: true
            }
          },
          scheduleSession: {
            select: {
              date: true,
              time: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' } // Added sorting
      }),
      this.databaseService.bookingSession.count({
        where: {
          expertID: id,
          status: PaymentStatus.paid
        }
      })
    ]);
  
    return {
      data: sessions,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  }

  async initializeTransaction(initializePaymentDTO: InitializePaymentDTO) {
    const user = await this.request.user
    const expert = await this.usersService.findOne({email: initializePaymentDTO.expertemail});
    if(!expert){
      throw new NotFoundException("Expert Not Found")
    }
    const metadata: PaystackMetadata = {
      user: user.email,
      expert: initializePaymentDTO.expertemail,
      custom_fields: [
        {
          display_name: 'Name',
          variable_name: 'name',
          value: initializePaymentDTO.aspirantname,
        },
        {
          display_name: 'Email',
          variable_name: 'email',
          value: user.email,
        },
        {
          display_name: 'Amount Paid',
          variable_name: 'amount Paid',
          value: `$5000`,
        },
      ],
    };

    const payload: { email: string; amount: number; metadata: PaystackMetadata; callback_url?: string } = {
      email: user.email,
      amount: initializePaymentDTO.amount, 
      metadata   
    };

    // const paystackCallbackUrl = "https://localhost:3500/paystack-transactions/callback";
    // if (paystackCallbackUrl) {
    //   payload.callback_url = paystackCallbackUrl;
    // }

    let result: PaystackCreateTransactionResponseDto = {} as PaystackCreateTransactionResponseDto;

    try {
      const responce = await axios.post<PaystackCreateTransactionResponseDto>('https://api.paystack.co/transaction/initialize', JSON.stringify(payload), 
        {
          headers: {
            Authorization: `Bearer sk_test_7769b18e5be12364577a0361b445afcbbed4fef3`,
            'Content-Type': 'application/json',
          },
        }
      )
      result = responce.data;
    } catch (error) {
      console.log(error)  
    }
    const data = result.data;


    return this.databaseService.$transaction(async(tx)=>{
      const transtion = tx.bookingSession.create({
        data: {
          UserId: user.id,
          expertID: expert.id,
          transactionReference: data.reference,
          paymentLink: data.authorization_url,
          amount: initializePaymentDTO.amount,  
          expertEmail: initializePaymentDTO.expertemail,
          aspirantEmail: user.email,
          status: PaymentStatus.notPaid,
          sessionScheduled: false, // Add appropriate date he
        }
      });
      await this.notificationService.create(
        {
          tag: NotificationTag.ASPIRANT_BOOKING_SESSION,
          userId: (await transtion).expertID ?? "",
          title: 'New Session Request',
          body: `An aspirant ${(await transtion).expertEmail} would love to book a session with you` ,
          link: ``,
          deviceToken: "",
        },
        tx,
      );
      return transtion
    })
  }

  async verifyTransaction(dto: PaystackCallbackDto) {
    const transaction = await this.databaseService.bookingSession.findFirst({
      where: {
        transactionReference: dto.reference, 
      },
    });
    if (!transaction) {
      return null;
    }
    const reference = transaction.transactionReference;
    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    let response: AxiosResponse<PaystackVerifyTransactionResponseDto> | null = null;
    try {
      response = await axios.get<PaystackVerifyTransactionResponseDto>(url, {
        headers: {
          Authorization: `Bearer sk_test_7769b18e5be12364577a0361b445afcbbed4fef3`,
        },
      });
    } catch (error) {
      // dosometing about this 
      console.log(error);
    }

    if (!response) {
      return null;
    }
    const result = response.data;

    const transactionStatus = result?.data?.status;
    const paymentConfirmed = transactionStatus === 'success';

    if (paymentConfirmed) {
      transaction.status = PaymentStatus.paid;
      transaction.transactionStatus = "SUCCESSFULL";
    } else {
      transaction.status = PaymentStatus.notPaid;
    }
    
    return this.databaseService.bookingSession.update({
      where: {  id: transaction.id },
      data: { status: transaction.status, transactionStatus: transaction.transactionStatus },
    });
  }
}
