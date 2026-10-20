import type { User } from '../../../generated/prisma/client';

/** DTO de saída: nunca expõe passwordHash. */
export class UserResponseDto {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  static from(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
