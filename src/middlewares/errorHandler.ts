import { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Rota ${req.method} ${req.originalUrl} não encontrada` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Dados inválidos', details: z.flattenError(err).fieldErrors });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Registro já existe' });
    if (err.code === 'P2025') return res.status(404).json({ message: 'Registro não encontrado' });
  }

  // JSON malformado no body (express.json)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON inválido' });
  }

  console.error(err);
  return res.status(500).json({
    message: 'Erro interno do servidor',
    ...(env.NODE_ENV !== 'production' && err instanceof Error ? { error: err.message } : {}),
  });
}
