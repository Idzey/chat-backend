import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { FilesService } from "./files.service";
import { FastifyRequest } from "fastify";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { User } from "src/common/decorators/user";
import { UserPayload } from "interfaces/auth/userPayload";

@ApiTags("files")
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload a file to MinIO storage" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Returns the uploaded file URL" })
  @ApiResponse({ status: 400, description: "No file provided" })
  @UseGuards(JwtAuthGuard)
  @Post("upload")
  async generateUploadUrl(
    @User() user: UserPayload,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();

    if (!file) {
      throw new BadRequestException("File is required");
    }

    const buffer = await file.toBuffer();

    const expressFile: Express.Multer.File = {
      fieldname: file.fieldname,
      originalname: file.filename,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: buffer.length,
      buffer,
      destination: "",
      filename: file.filename,
      path: "",
      stream: file.file,
    };

    const fileUrl = await this.filesService.uploadAndSaveFile(
      expressFile,
      user.id,
    );

    return fileUrl;
  }
}
