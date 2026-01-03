import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async sendMessage(message: string): Promise<string> {
    await Promise.resolve();
    return `echo: ${message}`;
  }
}
