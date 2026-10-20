import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { signToken } from '../../middlewares/auth';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';

export const authService = {
  async login({ email, password }: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Mesma mensagem para email inexistente ou senha errada (evita enumeração de usuários)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Credenciais inválidas', 401);
    }

    return {
      accessToken: signToken({ sub: user.id, email: user.email }),
      tokenType: 'Bearer',
      user: UserResponseDto.from(user),
    };
  },
};
