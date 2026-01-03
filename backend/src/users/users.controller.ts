import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { LoginDto } from './dto/login.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';

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

    const accessToken = this.authService.createAccessToken(user);
    console.log(accessToken);

    return { accessToken };
  }
}
