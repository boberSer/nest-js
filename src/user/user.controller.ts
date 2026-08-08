import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@User('id') id: number) {
    return await this.userService.getProfile(id);
  }

  @Post('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  async updateProfile(
    @User('id') id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.userService.updateProfile(id, dto, file);
  }

  @Get('profile/user/:id')
  async getUser(@Param('id') id: number, @User('id') currentId: number) {
    return await this.userService.getUserById(id, currentId);
  }
}
