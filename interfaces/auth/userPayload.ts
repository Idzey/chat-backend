import { Users } from "@prisma/client";

export type UserPayload = Omit<Users, 'passwordHash'>;