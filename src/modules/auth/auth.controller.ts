import {
  Controller,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from 'src/common/decorators/user';
import { UserPayload } from 'interfaces/auth/userPayload';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@User() user: UserPayload) {
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);
    return {
      message: 'User created successfully, check your email for verification',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const refreshToken = body.refreshToken;
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    return await this.authService.refresh(refreshToken);
  }
}
