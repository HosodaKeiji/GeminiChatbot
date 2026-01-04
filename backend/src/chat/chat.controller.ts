import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/user.entity';
import { GetUser } from '../auth/get-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(@GetUser() user: User, @Body() body: SendMessageDto) {
    return this.chatService.sendMessage(user.id, body.message, body.sessionId);
  }

  @Post('new-session')
  createSession(@GetUser() user: User, @Body('title') title?: string) {
    return this.chatService.createSession(user.id, title);
  }

  @Get('sessions')
  getSessions(@GetUser() user: User) {
    return this.chatService.getSessions(user.id);
  }

  @Get('messages')
  getMessages(@Query('sessionId') sessionId: string, @GetUser() user: User) {
    return this.chatService.getMessages(sessionId, user.id);
  }

  @Patch('session/:id')
  renameSession(
    @Param('id') sessionId: string,
    @Body('title') title: string,
    @GetUser() user: User,
  ) {
    return this.chatService.renameSession(sessionId, user.id, title);
  }

  @Delete('session/:id')
  async deleteSession(@Param('id') sessionId: string, @GetUser() user: User) {
    await this.chatService.deleteSession(sessionId, user.id);
    return { success: true };
  }
}
