import {
  Body,
  Controller, Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MomentService } from './moment.service';
import { CreateMomentDto } from './dto/create-moment.dto';
import { User } from '../auth/decorators/user.decorator';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('moments')
export class MomentController {
  constructor(private readonly momentService: MomentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imageUrl'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() dto: CreateMomentDto,
    @User('id') id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.momentService.create(id, dto, file);
  }

  @Post('like/:momentId')
  async likeMoment(
    @User('id') id: number,
    @Param('momentId') momentId: number,
  ) {
    return this.momentService.likeMoment(id, momentId);
  }

  @Get('library')
  async getMoments() {
    return this.momentService.getMoments();
  }
}
