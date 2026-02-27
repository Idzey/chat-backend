import {
  Controller,
  Post,
  UseGuards,
  Body,
  Response,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
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

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 200,
    description: "Returns accessToken (and refreshToken for mobile)",
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiBody({ type: DeviceTypeDto })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Response() res: FastifyReply,
    @User() user: UserPayload,
    @Body() dto: DeviceTypeDto,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(user);

    if (dto.deviceType == DeviceType.WEB) {
      this.cookieService.setCookie(res, "refresh_token", refreshToken);
    }

    const data = {
      accessToken,
    };

    if (dto.deviceType == DeviceType.MOBILE) {
      Object.assign(data, { refreshToken });
    }

    return res.status(200).send(data);
  }

  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({
    status: 400,
    description: "Validation error or email already in use",
  })
  @Post("signup")
  async signup(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);

    return { message: "User created successfully" };
  }

  @ApiOperation({
    summary: "Refresh access token (cookie for WEB, Bearer for MOBILE)",
  })
  @ApiResponse({ status: 200, description: "Returns new accessToken" })
  @ApiResponse({ status: 400, description: "Missing or invalid refresh token" })
  @Post("refresh")
  async refresh(
    @Response() res: FastifyReply,
    @Request() req: FastifyRequest,
    @Body() dto: DeviceTypeDto,
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
