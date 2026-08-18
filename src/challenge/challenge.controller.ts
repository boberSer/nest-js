import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { User } from '../auth/decorators/user.decorator';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('challenges')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('my')
  getChallenges(@User('id') userId: number) {
    return this.challengeService.getChallenges(userId);
  }

  @Post()
  create(@User('id') userId: number, @Body() dto: CreateChallengeDto) {
    return this.challengeService.create(userId, +dto.gameId, dto);
  }

  @Post(':challengeId')
  completeChallenge(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
  ) {
    return this.challengeService.completeChallenge(userId, challengeId);
  }

  @Put(':challengeId')
  update(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
    @Body() dto: UpdateChallengeDto,
  ) {
    return this.challengeService.update(userId, challengeId, dto);
  }

  @Patch(':challengeId')
  updateProgress(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.challengeService.updateProgress(userId, challengeId, dto);
  }
}
