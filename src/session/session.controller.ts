import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../auth/decorators/user.decorator';
import { EndSessionDto, StartSessionDto } from './dto/session.dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  async start(@User('id') userId: number, @Body() dto: StartSessionDto) {
    return this.sessionService.start(userId, dto.gameId, dto.subcategoryId);
  }

  @Post('stop')
  async stop(@User('id') userId: number, @Body() dto: EndSessionDto) {
    return this.sessionService.stop(userId, dto.gameId, dto.subcategoryId);
  }

  @Get()
  async getUserSessions(@User('id') userId: number) {
    return this.sessionService.getUserSessions(userId);
  }

  @Get('total/:gameId')
  async getTotalTime(
    @User('id') userId: number,
    @Param('gameId') gameId: number,
  ) {
    return this.sessionService.getTotalTime(+userId, +gameId);
  }

  @Get('total/:gameId/subcategory/:subcategoryId')
  async getSubcategoryTime(
    @User('id') userId: number,
    @Param('gameId') gameId: number,
    @Param('subcategoryId') subcategoryId: number,
  ) {
    return this.sessionService.getSubcategoryTime(
      +userId,
      +gameId,
      +subcategoryId,
    );
  }
}
