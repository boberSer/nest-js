import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { UploadService } from './upload.service';
// import {Response} from 'express';
// import path from 'path';
// import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  //
  // @Get(':folder/:filename')
  // async getUploadedFile(
  //   @Param('folder') folder: string,
  //   @Param('filename') filename: string,
  //   @Res() res: Response,
  // ) {
  //   // Собираем физический путь к файлу на твоем компьютере
  //   const filePath = path.join(process.cwd(), 'uploads', folder, filename);
  //
  //   // Если файла физически нет на диске
  //   if (!fs.existsSync(filePath)) {
  //     throw new NotFoundException('Файл не найден на сервере');
  //   }
  //
  //   // Отправляем файл клиенту (Дискорду или браузеру)
  //   return res.sendFile(filePath);
  // }
}
