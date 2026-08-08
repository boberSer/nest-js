import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { User } from '../auth/decorators/user.decorator';
import { CreateAchievementDto } from './dto/achievement.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Controller('achievement')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('my')
  async getAchievements(@User('id') userId: number) {
    return this.achievementService.getAchievements(userId);
  }

  @Get('my/game/:gameId')
  async getGameAchievement(
    @User('id') userId: number,
    @Param('gameId') gameId: number,
  ) {
    return this.achievementService.getGameAchievement(userId, gameId);
  }

  @Get('my/subcategory/:subcategoryId')
  async getSubcategoryAchievement(
    @User('id') userId: number,
    @Param('subcategoryId') subcategoryId: number,
  ) {
    return this.achievementService.getSubcategoryAchievement(
      userId,
      subcategoryId,
    );
  }

  @Get(':achievementId')
  async getAchievement(
    @User('id') userId: number,
    @Param('achievementId') achievementId: number,
  ) {
    return this.achievementService.getAchievement(userId, +achievementId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  async create(
    @User('id') userId: number,
    @Body() dto: CreateAchievementDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.achievementService.create(userId, dto, file);
  }

  @Put(':achievementId')
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  async update(
    @User('id') userId: number,
    @Param('achievementId') achievementId: number,
    @Body() dto: UpdateAchievementDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.achievementService.update(userId, achievementId, dto, file);
  }

  @Delete(':achievementId')
  async delete(
    @User('id') userId: number,
    @Param('achievementId') achievementId: number,
  ) {
    return this.achievementService.delete(userId, achievementId);
  }
}
