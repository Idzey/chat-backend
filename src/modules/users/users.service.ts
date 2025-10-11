import { PasswordService } from './../auth/services/password.service';
import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/libs/prisma/prisma.service";
import { CompleteUserDto } from "./dto/complete.dto";
import { isUUID } from "class-validator";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async findOne(username: string) {
    const user = await this.prisma.users.findUnique({
      where: { username },
    });
    return user;
  }

  async findUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    return user;
  }

  async getMe(userId: string) {
    const user = this.findUserById(userId);

    return user;
  }

  async getProfile(id: string) {
    if (!isUUID(id)) {
      throw new ConflictException(`Invalid profile ID: ${id}`);
    }

    const user = this.findUserById(id);

    return user;
  }

  async createAccount(
    name: string,
    email: string,
    password: string,
  ) {
    let username = "";
    let isTaken = true;

    while (isTaken) {
      username = `user_${Math.floor(Math.random() * 10000)}`;
      isTaken = await this.checkUsernameExists(username);
    }

    const passwordHash = await this.passwordService.hashPassword(password);

    const user = await this.prisma.users.create({
      data: {
        name,
        email,
        username,
        passwordHash,
      },
    });

    return user;
  }

  async checkUsernameExists(username: string) {
    const data = await this.prisma.users.findUnique({
      where: {
        username: username,
      },
    });

    return !!data;
  }

  async checkEmailExists(email: string) {
    const data = await this.prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    return !!data;
  }

  async completeRegistration(userId: string, dto: CompleteUserDto) {
    const { firstName, lastName } = dto;

    const profile = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (profile) {
      throw new ConflictException(
        `User with id ${userId} already has a profile.`
      );
    }

    await this.createAccount(userId, firstName, lastName);
  }

  async getAllProfiles(userId: string, username?: string) {
    const where = username ? { username: { contains: username } } : {};

    const profiles = await this.prisma.users.findMany({
      where,
      include: {
        userChats: {
          include: {
            chat: {
              include: {
                messages: true,
              },
            },
          },
        },
      },
    });

    return profiles.map((user) => 
      user.id == userId ? {
        ...user,
        firstName: "Saved",
        lastName: "Message"
      } : user
    );
  }
}
