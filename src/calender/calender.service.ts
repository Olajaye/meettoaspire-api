import { CreateScheduleDto} from './dtos/create-schedule.dto';
import { DatabaseService } from 'src/database/database.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { ValidResponse } from 'src/helper/valid-response';
import { UUID } from 'crypto';

@Injectable()
export class CalenderService {
  

  constructor(
    private readonly databaseService:DatabaseService,
    @Inject(REQUEST) private readonly request: Request,
  ){}

  async getExpertSchedule(id:UUID) {
    const scheduledSession = await this.databaseService.scheduleSession.findMany({
      where:{
        UserId: id
      }
    })
    return new ValidResponse("Schedule Created", scheduledSession)
  }


  async createSchedule(createScheduleDto: CreateScheduleDto){
    const user = this.request.user;
    const scheduledSession = await this.databaseService.scheduleSession.findFirst({
      where: { sessionRefrences: createScheduleDto.sessionRefrences }
    })
    if(scheduledSession){
      throw new BadRequestException("Session has been Scehduled")
    }
    
    const createSchedule: Prisma.ScheduleSessionUncheckedCreateInput = {
      title: createScheduleDto.title,
      type: createScheduleDto.type,
      date: createScheduleDto.date,
      time: createScheduleDto.time,
      description: createScheduleDto.description,
      sessionRefrences: createScheduleDto.sessionRefrences,
      aspirantId: createScheduleDto.aspirantId,
      UserId: user.id
    }

    const schedule = await this.databaseService.scheduleSession.create({ data: createSchedule})

    return new ValidResponse("Schedule Created", schedule)
  }
}
