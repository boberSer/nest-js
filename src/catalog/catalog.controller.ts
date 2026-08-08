import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { GameRequest } from './dto/game-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GameResponse } from './dto/game-response.dto';
import type { Request } from 'express';
import { JwtGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@Controller('catalog')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async findAll(): Promise<GameResponse | GameResponse[]> {
    return this.catalogService.findAll();
  }
  // @Get()
  // async findAll(
  //   @Query('name') name?: string,
  // ): Promise<GameResponse | GameResponse[]> {
  //   if (name) {
  //     return this.catalogService.findByName(name);
  //   }
  //
  //   return this.catalogService.findAll();
  // }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.catalogService.findById(+id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('coverImage'))
  @ApiConsumes('multipart/form-data')
  create(
    @Body(new ValidationPipe({ transform: true })) dto: GameRequest,
    @UploadedFile() file: Express.Multer.File,
    @User('id') userId: number,
  ): Promise<GameResponse> {
    return this.catalogService.create(userId, dto, file);
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Body(new ValidationPipe({ transform: true })) dto: GameRequest,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<GameResponse> {
    return this.catalogService.update(+id, dto, file);
  }

  @Delete('delete/:id')
  delete(
    @Param('id') id: string,
    @User('id') userId: number,
  ): Promise<GameResponse> {
    return this.catalogService.delete(+id, userId);
  }
}
