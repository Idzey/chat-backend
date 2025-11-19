import { Users } from "@prisma/client";

declare module 'fastify' {
    interface FastifyRequest {
      user?: Users;
    }
}