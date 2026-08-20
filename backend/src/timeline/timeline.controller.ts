import { Controller, Get, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../auth/decorators/user.decorator';

@Controller('timelines')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  async getAllEvents(@User('id') userId: number) {
    return this.timelineService.getAllEvents(userId);
  }
}
