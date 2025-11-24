export const s3Config = {
  endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
  useSSL: (process.env.MINIO_USE_SSL ?? 'false') === 'true',
  accessKeyId: process.env.MINIO_ACCESS_KEY ?? '',
  secretAccessKey: process.env.MINIO_SECRET_KEY ?? '',
  region: process.env.MINIO_REGION ?? 'us-east-1',
};