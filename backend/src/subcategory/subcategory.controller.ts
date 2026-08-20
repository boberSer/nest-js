import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import SubcategoryService from './subcategory.service';
import { SubcategoryRequest } from './dto/subcategory-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/auth.guard';

@Controller('catalog/:gameId/subcategories')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('gameId') gameId: number,
    @Body() dto: SubcategoryRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.subcategoryService.create(gameId, dto, file);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('gameId') gameId: number,
    @Param('id') id: number,
    @Body() dto: SubcategoryRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.subcategoryService.update(id, gameId, dto, file);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Param('gameId') gameId: number) {
    await this.subcategoryService.delete(id, gameId);
  }
}
