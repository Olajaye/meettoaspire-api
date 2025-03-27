import { CreateScheduleDto} from './dtos/create-schedule.dto';
import { DatabaseService } from 'src/database/database.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { ValidResponse } from 'src/helper/valid-response';
import { UUID } from 'crypto';
import { NotificationTag } from 'src/helper/enums/notification-tags.enum';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CalenderService {
  constructor(
    private readonly databaseService:DatabaseService,
    private notificationService: NotificationService,
    @Inject(REQUEST) private readonly request: Request,
  ){}


  async getExpertSchedule(id: UUID, page: number = 1) {
    const limit = 10; 
    const skip = (page - 1) * limit; 
  
    const scheduledSessions = await this.databaseService.scheduleSession.findMany({
      where: {
        UserId: id,
      },
      take: limit, 
      skip: 0, 
    });
  
    return new ValidResponse("Scheduled Sessions", scheduledSessions);
  }
  
  async getAspirantSchedule(id: UUID, page: number = 1) {
    const limit = 10; 
    const skip = (page - 1) * limit;
  
    const [scheduledSessions, total] = await Promise.all([
      this.databaseService.scheduleSession.findMany({
        where: {
          aspirantId: id,
        },
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              profilePicture: true,
              overview: true,
              profession: true,
            },
          },
        },
        take: limit, // Fetch only 10 records
        skip: skip, // Skip records for pagination
      }),
      this.databaseService.scheduleSession.count({
        where: {
          aspirantId: id,
        },
      }),
    ]);
  
    return new ValidResponse("Aspirant Schedule", {
      data: scheduledSessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  }

  async createSchedule(createScheduleDto: CreateScheduleDto) {
    const user = this.request.user;

    const scheduledSession = await this.databaseService.scheduleSession.findFirst({
      where: { sessionRefrences: createScheduleDto.sessionRefrences }
    });
    
    if (scheduledSession) {
      throw new BadRequestException("Session has already been scheduled");
    }
  
    const createSchedule: Prisma.ScheduleSessionUncheckedCreateInput = {
      title: createScheduleDto.title,
      type: createScheduleDto.type,
      date: createScheduleDto.date,
      time: createScheduleDto.time,
      description: createScheduleDto.description,
      sessionRefrences: createScheduleDto.sessionRefrences,
      aspirantId: createScheduleDto.aspirantId,
      UserId: user.id,
      booking: createScheduleDto.sessionRefrences,
    };
  
    try {
      return await this.databaseService.$transaction(async (tx) => {
        // 1. Create the schedule
        const schedule = await tx.scheduleSession.create({ 
          data: createSchedule 
        });
  
        // 2. Update the booking status
        await tx.bookingSession.update({
          where: { id: Number(createScheduleDto.bookingId) },
          data: { sessionScheduled: true }
        });
  
        // 3. Create notification (within same transaction)
        await this.notificationService.create(
          {
            tag: NotificationTag.EXPERT_SCHEDULE_SESSION,
            userId: schedule.aspirantId,
            title: 'Scheduled Session',
            body: `Congratulations! ${user.email} scheduled a session with you. Check your calendar for details.`,
            link: ``,
            deviceToken: "",
          },
          tx, // Pass transaction instance
        );
  
        return new ValidResponse("Schedule Created", schedule);
      }, {
       
        maxWait: 5000, 
        timeout: 10000, 
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Database operation failed');
      }
      throw error;
    }
  }


  // async getAspirantSchedule(id:UUID) {
  //   const scheduledSession = await this.databaseService.scheduleSession.findMany({
  //     where:{
  //       aspirantId: id
  //     },
  //     include:{
  //       User:{
  //         select:{
  //           firstName:true,
  //           lastName: true,
  //           middleName:true,
  //           profilePicture: true,
  //           overview: true,
  //           profession: true
  //         }
  //       }
  //     }
  //   })
  //   return new ValidResponse("Schedule Created", scheduledSession)
  // }


  // async createSchedule(createScheduleDto: CreateScheduleDto){
  //   const user = this.request.user;
  //   const scheduledSession = await this.databaseService.scheduleSession.findFirst({
  //     where: { sessionRefrences: createScheduleDto.sessionRefrences }
  //   })

  //   if(scheduledSession){
  //     throw new BadRequestException("Session has been Scehduled")
  //   }
    
  //   const createSchedule: Prisma.ScheduleSessionUncheckedCreateInput = {
  //     title: createScheduleDto.title,
  //     type: createScheduleDto.type,
  //     date: createScheduleDto.date,
  //     time: createScheduleDto.time,
  //     description: createScheduleDto.description,
  //     sessionRefrences: createScheduleDto.sessionRefrences,
  //     aspirantId: createScheduleDto.aspirantId,
  //     UserId: user.id,
  //     booking:createScheduleDto.sessionRefrences,
  //   }

  //   return this.databaseService.$transaction(async (tx) => {
  //     const schedule = await tx.scheduleSession.create({ data: createSchedule})

  //     await tx.bookingSession.update({
  //       where: {
  //         id: Number(createScheduleDto.bookingId)
  //       },
  //       data:{
  //         sessionScheduled: true
  //       } 
        
  //     })
  //     await this.notificationService.create(
  //       {
  //         tag: NotificationTag.EXPERT_SCHEDULE_SESSION,
  //         userId: schedule.aspirantId,
  //         title: 'Schedele Session',
  //         body: `Congratulation ${user.email} schedule a session with you check your calender for more detalis` ,
  //         link: ``,
  //         deviceToken: "",
  //       },
  //       tx,
  //     );

  //     return new ValidResponse("Schedule Created", schedule);

  //   })
  // }
}
