import {
  Controller,
  Post,
  UseGuards,
  Body,
  Response,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "../../common/guards/local-auth.guard";
import { CreateUserDto } from "./dto/createUser.dto";
import { User } from "src/common/decorators/user";
import { UserPayload } from "interfaces/auth/userPayload";
import { CookieService } from "./services/cookie.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { DeviceTypeDto } from "./dto/deviceType.dto";
import { DeviceType } from "interfaces/auth/DeviceType";
import { ExtractJwt } from "passport-jwt";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Response() res: FastifyReply, @User() user: UserPayload, @Body() dto: DeviceTypeDto) {
    const { accessToken, refreshToken } = this.authService.login(user);

    if (dto.deviceType == DeviceType.WEB) {
      this.cookieService.setCookie(res, "refresh_token", refreshToken);
    }
    
    const data = {
      accessToken,
    }

    if (dto.deviceType == DeviceType.MOBILE) {
      Object.assign(data, { refreshToken });
    }

    return res.status(200).send(data);
  }

  @Post("signup")
  async signup(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);

    return { message: "User created successfully" };
  }

  @Post("refresh")
  async refresh(
    @Response() res: FastifyReply,
    @Request() req: FastifyRequest,
    @Body() dto: DeviceTypeDto
  ) {
    let refreshToken: string | null;

    if (dto.deviceType == DeviceType.WEB) {
      refreshToken = this.cookieService.getCookie(req, "refresh_token");
    } else if (dto.deviceType == DeviceType.MOBILE) {
      refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || null;
    } else {
      throw new BadRequestException("Invalid device type");
    }

    if (!refreshToken) {
      throw new BadRequestException("Refresh token is required");
    }

    const authTokens = await this.authService.refresh(refreshToken);

    const data = {
      accessToken: authTokens.accessToken,
    };

    if (dto.deviceType == DeviceType.MOBILE) {
      Object.assign(data, { refreshToken: authTokens.refreshToken });
    }

    return res.status(200).send(data);
  }
}
