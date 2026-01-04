import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Request } from 'express';

type RequestWithUser = Request & { user: User };

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
