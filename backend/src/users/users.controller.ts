import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
  ): Promise<{ id: string; email: string }> {
    const user = await this.usersService.create(dto);
    return { id: user.id, email: user.email };
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: this.authService.createAccessToken(user),
    };
  }

  /** 🔐 ログイン中ユーザー取得 */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
