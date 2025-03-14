import { CalenderService } from './calender.service';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateScheduleDto, ExpertScheduleDto } from './dtos/create-schedule.dto';
import { UUID } from 'crypto';

@ApiTags('Schedule Session')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule-session')
export class CalenderController {
  constructor(
    private readonly calenderService: CalenderService
  ){}

  @Post()
  async creatSchedule(@Body() createScheduleDto:CreateScheduleDto){
    return  await this.calenderService.createSchedule(createScheduleDto)
  }

  @Get('/expert/:id')
  async getExpertSchedule(@Param('id', ParseUUIDPipe) id:UUID){
    return await this.calenderService.getExpertSchedule(id)
  }

  @Get('/aspirant/:id')
  async getAspirantSchedule(@Param('id', ParseUUIDPipe) id:UUID){
    return await this.calenderService.getAspirantSchedule(id)
  }
}
