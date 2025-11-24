import { Injectable } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { PrismaService } from "../libs/prisma/prisma.service";
import { FileType } from "@prisma/client";

@Injectable()
export class FilesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService
  ) {}

  async uploadAndSaveFile(
    file: Express.Multer.File,
    userId: string,
    options?: { prefix?: string }
  ) {
    const s3Result = await this.s3Service.uploadBuffer(file, {
      prefix: options?.prefix,
    });

    const saved = await this.prisma.file.create({
      data: {
        filename: s3Result.key,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: s3Result.size,
        path: `${s3Result.bucket}/${s3Result.key}`,
        url: s3Result.url,
        uploadedBy: userId,
        type: file.mimetype.startsWith("image/")
          ? FileType.IMAGE
          : file.mimetype.startsWith("audio/")
            ? FileType.AUDIO
            : FileType.FILE,
      },
    });

    return saved;
  }
}
