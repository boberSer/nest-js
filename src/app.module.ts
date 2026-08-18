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
import { UserModule } from './user/user.module';
import { StatisticModule } from './statistic/statistic.module';
import { ChallengeModule } from './challenge/challenge.module';
import { MomentModule } from './moment/moment.module';
import { FriendModule } from './friend/friend.module';
import { ReviewModule } from './review/review.module';
import { TagModule } from './tag/tag.module';
import { TimelineModule } from './timeline/timeline.module';
import { DiscordModule } from './discord/discord.module';

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
    UserModule,
    StatisticModule,
    ChallengeModule,
    MomentModule,
    FriendModule,
    ReviewModule,
    TagModule,
    TimelineModule,
    DiscordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
