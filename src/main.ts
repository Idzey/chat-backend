import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AsyncApiModule, AsyncApiDocumentBuilder } from "nestjs-asyncapi";

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 1024,
      fieldSize: 128 * 1024 * 1024 * 1024,
      fields: 10,
      fileSize: 128 * 1024 * 1024 * 1024,
      files: 2,
      headerPairs: 2000,
    },
  });

  fastifyAdapter.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},
  });

  const app = await NestFactory.create(AppModule, fastifyAdapter);

  app.enableCors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Chat Backend API")
    .setDescription("REST API documentation for the Chat application")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User profile management")
    .addTag("chats", "Chat room management")
    .addTag("messages", "Chat message operations")
    .addTag("files", "File upload & storage")
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, swaggerDocument, {
    jsonDocumentUrl: "api/docs-json",
    yamlDocumentUrl: "api/docs-yaml",
  });

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle("Chat WebSocket API")
    .setDescription("Socket.IO real-time events documentation")
    .setVersion("1.0")
    .setDefaultContentType("application/json")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .addServer("chat-backend", {
      url: `ws://localhost:${process.env.PORT ?? 3000}`,
      protocol: "socket.io",
    })
    .build();

  const asyncApiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup("/async-api", app, asyncApiDocument);

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
