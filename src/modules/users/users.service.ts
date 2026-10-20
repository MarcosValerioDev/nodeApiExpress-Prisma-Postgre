import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { Prisma } from '../../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ListUsersQuery } from './users.schemas';

const SALT_ROUNDS = 10;

export const usersService = {
  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new AppError('Email já cadastrado', 409);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, SALT_ROUNDS),
      },
    });
    return UserResponseDto.from(user);
  },

  async list({ page, limit, search }: ListUsersQuery) {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(UserResponseDto.from),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(id: string): Promise<UserResponseDto> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return UserResponseDto.from(user);
  },

  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id);

    if (data.email) {
      const emailOwner = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailOwner && emailOwner.id !== id) throw new AppError('Email já cadastrado', 409);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        ...(data.password && { passwordHash: await bcrypt.hash(data.password, SALT_ROUNDS) }),
      },
    });
    return UserResponseDto.from(user);
  },

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
  },
};
