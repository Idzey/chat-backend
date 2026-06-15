import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
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
  ApiConsumes,
} from "@nestjs/swagger";
import { User } from "src/common/decorators/user";
import { CompleteUserDto } from "./dto/complete.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";
import { FilesService } from "../files/files.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UserPayload } from "interfaces/auth/userPayload";
import { FastifyRequest } from "fastify";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

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
  @ApiOperation({ summary: "Update current user profile (name, username)" })
  @ApiResponse({ status: 200, description: "Updated user profile" })
  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(@User() user: UserPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload and update current user avatar" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "Updated user with new avatar" })
  @UseGuards(JwtAuthGuard)
  @Patch("me/avatar")
  async updateAvatar(@User() user: UserPayload, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const buffer = await file.toBuffer();
    const expressFile: Express.Multer.File = {
      fieldname: file.fieldname,
      originalname: file.filename ?? file.fieldname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: buffer.length,
      buffer,
      destination: "",
      filename: file.filename ?? file.fieldname,
      path: "",
      stream: file.file,
    };

    const saved = await this.filesService.uploadAndSaveFile(
      expressFile,
      user.id,
      {
        prefix: "avatars",
      },
    );

    return this.usersService.updateAvatar(user.id, saved.url ?? saved.path);
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
