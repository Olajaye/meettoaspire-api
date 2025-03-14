import { Controller, Post } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Controller('meeting')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  @Post()
  async createMeeting() {
    return this.zoomService.generateZoomMeeting();
  }
}