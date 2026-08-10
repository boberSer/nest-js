import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { User } from '../auth/decorators/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/auth.guard';

@Controller('friends')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request/:friendId')
  async sendFriendRequest(
    @User('id') userId: number,
    @Param('friendId') friendId: number,
  ) {
    return this.friendService.sendFriendRequest(userId, friendId);
  }

  @Post('accept/:friendId')
  async acceptFriendRequest(
    @User('id') userId: number,
    @Param('friendId') friendId: number,
  ) {
    return this.friendService.acceptFriendRequest(userId, friendId);
  }

  @Post('reject/:friendId')
  async rejectFriendRequest(
    @User('id') userId: number,
    @Param('friendId') friendId: number,
  ) {
    return this.friendService.rejectFriendRequest(userId, friendId);
  }

  @Post(':friendId')
  async removeFriend(
    @User('id') userId: number,
    @Param('friendId') friendId: number,
  ) {
    return this.friendService.removeFriend(userId, friendId);
  }

  @Post('block/:friendId')
  async blockFriend(
    @User('id') userId: number,
    @Param('friendId') friendId: number,
  ) {
    return this.friendService.blockFriend(userId, friendId);
  }

  @Get()
  async getFriends(@User('id') userId: number) {
    return this.friendService.getFriends(userId);
  }

  @Get()
  async getIncomingRequests(@User('id') userId: number) {
    return this.friendService.getIncomingRequests(userId);
  }
}
