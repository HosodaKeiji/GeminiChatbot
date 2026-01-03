import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { LoginDto } from './dto/login.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

    const token: string = jwt.sign({ sub: user.id }, 'secret-key', {
      expiresIn: '1h',
    });

    return { accessToken: token };
  }
}
