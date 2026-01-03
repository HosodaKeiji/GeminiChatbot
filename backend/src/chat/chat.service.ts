import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message, MessageRole } from './entities/message.entity';
import { User } from '../users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepo: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly usersService: UsersService,
  ) {}

  async sendMessage(userId: string, content: string): Promise<string> {
    // ① ユーザーの最新チャットセッションを取得（なければ作成）
    let session = await this.sessionRepo.findOne({
      where: { user: { id: userId } },
      relations: ['messages', 'user'],
      order: { createdAt: 'DESC' },
    });

    if (!session) {
      session = this.sessionRepo.create({
        user: { id: userId } as User,
        title: 'New Chat',
      });
      await this.sessionRepo.save(session);
    }

    // ② ユーザーのメッセージを保存
    const userMessage = this.messageRepo.create({
      session,
      role: MessageRole.USER,
      content,
    });
    await this.messageRepo.save(userMessage);

    // ③ AI の返信を生成（今はダミー）
    const aiReplyContent = `${content}`;

    const aiMessage = this.messageRepo.create({
      session,
      role: MessageRole.ASSISTANT,
      content: aiReplyContent,
    });
    await this.messageRepo.save(aiMessage);

    return aiReplyContent;
  }
}
