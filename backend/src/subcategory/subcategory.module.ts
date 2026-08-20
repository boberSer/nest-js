import { Module } from '@nestjs/common';
import SubcategoryService from './subcategory.service';
import { SubcategoryController } from './subcategory.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
})
export class SubcategoryModule {}
