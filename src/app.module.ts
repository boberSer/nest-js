import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { CatalogModule } from './catalog/catalog.module';
import { UploadModule } from './upload/upload.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { FavoriteModule } from './favorite/favorite.module';
import { SessionModule } from './session/session.module';
import { AchievementModule } from './achievement/achievement.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CatalogModule,
    UploadModule,
    SubcategoryModule,
    FavoriteModule,
    SessionModule,
    AchievementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
