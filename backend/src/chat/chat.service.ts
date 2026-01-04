import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message, MessageRole } from './entities/message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepo: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async sendMessage(
    userId: string,
    content: string,
    sessionId?: string,
  ): Promise<{ reply: string; sessionId: string }> {
    let session: ChatSession | null = null;

    if (sessionId) {
      session = await this.sessionRepo.findOne({
        where: { id: sessionId, user: { id: userId } },
        relations: ['user'],
      });

      if (!session) {
        throw new Error('Session not found or access denied');
      }
    } else {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      session = this.sessionRepo.create({
        user,
        title: 'New Chat',
      });
      await this.sessionRepo.save(session);
    }

    // USER メッセージ
    await this.messageRepo.save(
      this.messageRepo.create({
        session,
        role: MessageRole.USER,
        content,
      }),
    );

    // AI メッセージ（仮）
    const reply = content;
    await this.messageRepo.save(
      this.messageRepo.create({
        session,
        role: MessageRole.ASSISTANT,
        content: reply,
      }),
    );

    return {
      reply,
      sessionId: session.id,
    };
  }

  async getSessions(userId: string): Promise<ChatSession[]> {
    return this.sessionRepo.find({
      where: { user: { id: userId } },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMessages(sessionId: string, userId: string): Promise<Message[]> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
      relations: ['messages'],
    });

    if (!session) return [];
    return session.messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const session = this.sessionRepo.create({
      user,
      title: title ?? 'New Chat',
    });
    return this.sessionRepo.save(session);
  }

  async renameSession(
    sessionId: string,
    userId: string,
    title: string,
  ): Promise<ChatSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    session.title = title;
    return this.sessionRepo.save(session);
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await this.sessionRepo.remove(session);
  }
}
