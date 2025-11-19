import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}
 
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient() as any;
    const token = client.handshake?.auth?.token;

    if (!token || typeof token !== 'string') throw new UnauthorizedException('No token provided');


    try {
      const payload = this.jwtService.verify(token) as { sub?: string };
      
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.usersService.findUserById(payload.sub);

      client.data = { user };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}