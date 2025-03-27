import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UUID } from 'crypto';
import { FilterNotificationsDTO } from './dto/filter-notification.dto';
import { RegisterDeviceTokenDTO } from './dto/register-device-token.dto';
import { NotificationDTO } from './dto/notification.dto';
import { ValidResponse } from '../helper/valid-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async registerDevice(@Body() dto: RegisterDeviceTokenDTO) {
    return await this.notificationService.storeDeviceToken(dto);
  }

  @Get()
  async findAll(@Query() dto: FilterNotificationsDTO) {
    return await this.notificationService.filterAndPaginate(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return await this.notificationService.findOne({ id });
  }

  @Patch('mark-as-read/:id')
  async markAsRead(@Param('id', ParseUUIDPipe) id: UUID) {
    const userNotification = await this.notificationService.update(id, {
      status: 'READ',
    });
    return new ValidResponse(
      'Notification updated successfully',
      new NotificationDTO(userNotification),
    );
  }

  @Patch('mark-as-unread/:id')
  async markAsUnRead(@Param('id', ParseUUIDPipe) id: UUID) {
    const userNotification = await this.notificationService.update(id, {
      status: 'UNREAD',
    });
    return new ValidResponse(
      'Notification updated successfully',
      new NotificationDTO(userNotification),
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: UUID) {
    await this.notificationService.remove({ id });
    return new ValidResponse('Notification(s) Deleted Successfully');
  }
}
