import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ): Promise<{ reply: string }> {
    // JwtAuthGuardで認証されればreq.userが入る
    const user = req.user as { id: string; email: string };

    const reply = await this.chatService.sendMessage(user.id, dto.message);
    return { reply };
  }
}
