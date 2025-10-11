import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from 'interfaces/auth/userPayload';
import { CreateUserDto } from './dto/createUser.dto';
import jwtPayload from 'interfaces/auth/jwtPayload';
import RefreshTokenPayload from 'interfaces/auth/refreshTokenPayload';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { PrismaService } from '../libs/prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async getMe(email: string) {
    const user = await this.findUserByEmail(email);

    return user;
  }

  async createUser(dto: CreateUserDto) {
    const { name, email, password } = dto;

    const checkEmailExists = await this.findUserByEmail(email);

    if (checkEmailExists) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersService.createAccount(name, email, password);

    return user;
  }

  private async findUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  private async findUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return null;
    }
    
    if (!user.passwordHash) {
      return null;
    }
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.passwordHash,
    );
    
    if (!isPasswordValid) {
      return null;
    }

    return user as UserPayload;
  }

  login(user: UserPayload) {
    const payload: jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name ?? '',
    };

    const { accessToken, refreshToken } = this.auth(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  private auth(payload: jwtPayload) {
    const { accessToken, refreshToken } =
      this.tokenService.generateAuthTokens(payload);

    return {
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const refreshPayload: RefreshTokenPayload =
      this.jwtService.verify(refreshToken);

    if (refreshPayload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const user = await this.findUserById(refreshPayload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name ?? '',
    };

    const { accessToken, refreshToken: newRefreshToken } = this.auth(payload);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
