import { Controller, Post, UseGuards, Body, Response, Request, BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "../../common/guards/local-auth.guard";
import { CreateUserDto } from "./dto/createUser.dto";
import { User } from "src/common/decorators/user";
import { UserPayload } from "interfaces/auth/userPayload";
import { CookieService } from "./services/cookie.service";
import { FastifyReply, FastifyRequest } from "fastify";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Response() res: FastifyReply, @User() user: UserPayload) {
    const { accessToken, refreshToken } = this.authService.login(user);

    this.cookieService.setCookie(res, "refresh_token", refreshToken);

    return res.status(200).send({ accessToken });
  }

  @Post("signup")
  async signup(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);
    
    return { message: "User created successfully" };
  }

  @Post("refresh")
  async refresh(@Request() req: FastifyRequest) {
    const refreshToken = this.cookieService.getCookie(req, "refresh_token");

    if (!refreshToken) {
      throw new BadRequestException("Refresh token is required");
    }

    const { accessToken } = await this.authService.refresh(refreshToken);
    
    return { accessToken };
  }
}
