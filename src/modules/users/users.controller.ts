import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { User } from 'src/common/decorators/user';
import { CompleteUserDto } from './dto/complete.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserPayload } from 'interfaces/auth/userPayload';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@User() user: UserPayload) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = await this.usersService.getMe(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search/:username')
  async getAllProfiles(
    @User() user: UserPayload,
    @Param('username') username: string,
  ) {
    const profiles = await this.usersService.getAllProfiles(user.id, username);
    
    return profiles;
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Profile ID is required');
    }

    const profile = await this.usersService.getProfile(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-registration')
  async completeRegistration(@User() user: UserPayload, @Body() dto: CompleteUserDto) {
    return this.usersService.completeRegistration(user.id, dto);
  }

  @Get('check-username/:username')
  checkUsernameExists(@Param('username') username: string) {
    return this.usersService.checkUsernameExists(username);
  };

  @Post('check-email')
  checkEmailExists(@Body('email') email: string) {
    return this.usersService.checkEmailExists(email);
  };
}
