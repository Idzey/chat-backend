import { S3Client, HeadBucketCommand, CreateBucketCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { s3Config } from 'src/config/s3.config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  public readonly client: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET ?? 'chat-files';

  constructor() {
    if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
      throw new Error('MINIO_ACCESS_KEY or MINIO_SECRET_KEY not set');
    }

    this.client = new S3Client({
      region: s3Config.region,
      endpoint: `${s3Config.useSSL ? 'https' : 'http'}://${s3Config.endpoint}:${s3Config.port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    });
  }

  private buildKey(prefix?: string, originalName?: string) {
    const d = new Date();
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const base = `${yyyy}/${mm}/${dd}`;
    const folder = prefix ? `${prefix}/${base}` : base;
    const ext = originalName ? extname(originalName) : '';
    return `${folder}/${randomUUID()}${ext}`;
  }

  private async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async uploadBuffer(file: Express.Multer.File, options?: { prefix?: string }) {
    await this.ensureBucket();
    const key = this.buildKey(options?.prefix, file.originalname);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentLength: file.size,
        ContentType: file.mimetype,
      }),
    );

    const expires = parseInt(process.env.MINIO_PRESIGNED_EXPIRES ?? '3600', 10);
    const url: string = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expires },
    );

    return {
      bucket: this.bucket,
      key,
      url,
      size: file.size,
      contentType: file.mimetype,
      originalName: file.originalname,
    };
  }
}