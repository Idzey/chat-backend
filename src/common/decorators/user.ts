import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Users => {
    const request: FastifyRequest = ctx.switchToHttp().getRequest<FastifyRequest>();
    
    if (!request.user) {
      throw new Error('User not found in request. Make sure authentication middleware is applied.');
    }

    return request.user;
  },
);