import { Controller, Body, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(@Body() dto: SendMessageDto): Promise<{ reply: string }> {
    const reply = await this.chatService.sendMessage(dto.message);
    return { reply };
  }
}
