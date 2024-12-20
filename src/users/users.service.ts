import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  BCRYPT_SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<GetUserDto> {
    const userWithSameEmail: User | null = await this.findOneBy({
      email: data.email,
    });

    if (userWithSameEmail) {
      throw new BadRequestException('User with given email already exists.');
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      this.BCRYPT_SALT_ROUNDS,
    );

    const user: User = await this.prisma.user.create({
      data: {
        id: v4(),
        ...data,
        password: hashedPassword,
      },
    });

    return this.returnWithoutPassword(user);
  }

  async findAll(): Promise<GetUserDto[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => this.returnWithoutPassword(user));
  }

  async findOne(id: string): Promise<GetUserDto> {
    const user: User | null = await this.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User with given id does not exist.');
    }

    return this.returnWithoutPassword(user);
  }

  async findByCredentials(
    email: string,
    password: string,
  ): Promise<GetUserDto | null> {
    const user = await this.findOneBy({ email });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    return !isMatch ? null : this.returnWithoutPassword(user);
  }

  async update(id: string, data: UpdateUserDto): Promise<GetUserDto> {
    const user: User | null = await this.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User with given id does not exist.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: data,
    });

    if (data.password) {
      const hashedPassword = await bcrypt.hash(
        data.password,
        this.BCRYPT_SALT_ROUNDS,
      );

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    }

    return this.returnWithoutPassword(updatedUser);
  }

  private async findOneBy(
    criteria: Partial<Record<keyof User, any>>,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: criteria,
    });
  }

  private returnWithoutPassword(user: User): GetUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
