import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export interface JwtPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Token não fornecido', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    req.user = { sub: String(decoded.sub), email: String(decoded.email) };
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}

/** Garante que o usuário autenticado só acesse o próprio recurso (:id). */
export function onlySelf(req: Request, res: Response, next: NextFunction) {
  const id = res.locals.params?.id ?? req.params.id;
  if (req.user?.sub !== id) {
    throw new AppError('Acesso negado', 403);
  }
  next();
}
