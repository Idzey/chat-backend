import { Injectable } from '@nestjs/common';
import jwtPayload from '../../../../interfaces/auth/jwtPayload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  private generateToken(payload: any, expiresIn: string) {
    const token = this.jwtService.sign(payload, {
      expiresIn,
    });

    return token;
  }

  generateAuthTokens(payload: jwtPayload) {
    const accessToken = this.generateToken(payload, '1h');

    const refreshToken = this.generateToken(
      {
        sub: payload.sub,
        type: 'refresh',
      },
      '14d',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  generateEmailToken(payload: jwtPayload) {
    const emailToken = this.generateToken(payload, '1m');

    return emailToken;
  }
}
