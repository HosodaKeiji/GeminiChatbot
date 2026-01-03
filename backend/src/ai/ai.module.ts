import { Module } from '@nestjs/common';
import { GeminiService } from './gemini/gemini.service';

@Module({
  providers: [GeminiService]
})
export class AiModule {}
