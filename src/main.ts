import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';


async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 1024, // Max field name size in bytes
      fieldSize: 128 * 1024 * 1024 * 1024, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 128 * 1024 * 1024 * 1024, // For multipart forms, the max file size
      files: 2, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });

  fastifyAdapter.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},
  });

  const app = await NestFactory.create(
    AppModule,
    fastifyAdapter,
  );

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, 
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();