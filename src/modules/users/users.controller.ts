import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { User } from "src/common/decorators/user";
import { CompleteUserDto } from "./dto/complete.dto";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UserPayload } from "interfaces/auth/userPayload";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user profile" })
  @ApiResponse({ status: 200, description: "Returns user profile" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@User() user: UserPayload) {
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const profile = await this.usersService.getMe(user.id);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Search users by username" })
  @ApiParam({ name: "username", description: "Username to search for" })
  @ApiResponse({
    status: 200,
    description: "Returns list of matching user profiles",
  })
  @UseGuards(JwtAuthGuard)
  @Get("/search/:username")
  async getAllProfiles(
    @User() user: UserPayload,
    @Param("username") username: string,
  ) {
    const profiles = await this.usersService.getAllProfiles(user.id, username);

    return profiles;
  }

  @ApiOperation({ summary: "Get public user profile by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "Returns user profile" })
  @ApiResponse({ status: 404, description: "Profile not found" })
  @Get(":id")
  async getProfile(@Param("id") id: string) {
    if (!id) {
      throw new BadRequestException("Profile ID is required");
    }

    const profile = await this.usersService.getProfile(id);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Complete user registration with first/last name" })
  @ApiResponse({ status: 201, description: "Registration completed" })
  @UseGuards(JwtAuthGuard)
  @Post("complete-registration")
  async completeRegistration(
    @User() user: UserPayload,
    @Body() dto: CompleteUserDto,
  ) {
    return this.usersService.completeRegistration(user.id, dto);
  }

  @ApiOperation({ summary: "Check if username is taken" })
  @ApiParam({ name: "username", description: "Username to check" })
  @Get("check-username/:username")
  checkUsernameExists(@Param("username") username: string) {
    return this.usersService.checkUsernameExists(username);
  }

  @ApiOperation({ summary: "Check if email is taken" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { email: { type: "string", example: "user@example.com" } },
    },
  })
  @Post("check-email")
  checkEmailExists(@Body("email") email: string) {
    return this.usersService.checkEmailExists(email);
  }
}
