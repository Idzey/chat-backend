import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext){
    const client = context.switchToWs().getClient() as any;
    const token = client.handshake?.auth?.token;
    if (!token || typeof token !== 'string') throw new UnauthorizedException('No token provided');

    try {
      const payload = this.jwtService.verify(token);

      client.data = { user: payload };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}