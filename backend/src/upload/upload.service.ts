import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  upload(file: Express.Multer.File, folder: string = 'general') {
    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    const uniqName = `${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(file.originalname)}`;

    const filePath = path.join(uploadDir, uniqName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    return {
      path: `/uploads/${folder}/${uniqName}`,
      fullPath: filePath,
      fileName: uniqName,
    };
  }
}
