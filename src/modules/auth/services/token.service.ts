import { Injectable } from "@nestjs/common";
import jwtPayload from "../../../../interfaces/auth/jwtPayload";
import { JwtService } from "@nestjs/jwt";
import * as crypto from "crypto";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  private generateToken(payload: any, expiresIn: string) {
    const token = this.jwtService.sign(payload, {
      expiresIn,
    });

    return token;
  }

  private generateOpaqueToken(size = 32) {
    return crypto.randomBytes(size).toString("base64url");
  }

  getAuthTokens(payload: jwtPayload) {
    const accessToken = this.generateToken(payload, "1h");
    const refreshToken = this.generateOpaqueToken();

    return {
      accessToken,
      refreshToken,
    };
  }

  generateEmailToken(payload: jwtPayload) {
    const emailToken = this.generateToken(payload, "1m");

    return emailToken;
  }
}
