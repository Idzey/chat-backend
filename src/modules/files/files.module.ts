import { Module } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

@Module({
  controllers: [FilesController],
  providers: [S3Service, FilesService],
  exports: [FilesService],
})

export class FilesModule {}