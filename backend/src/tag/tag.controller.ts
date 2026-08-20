import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/auth.guard';
import { CreateTagDto } from './dto/create-tag.dto';
import { AddTagDto } from './dto/add-tag.dto';

@Controller('tags')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  async create(@Body() dto: CreateTagDto) {
    return await this.tagService.create(dto);
  }

  @Post(':gameId')
  async addTag(@Param('gameId') gameId: number, @Body() dto: AddTagDto) {
    return await this.tagService.addTag(gameId, dto.tagId);
  }

  @Get()
  async getTags() {
    return this.tagService.getTags();
  }
}
