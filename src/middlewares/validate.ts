import { NextFunction, Request, Response } from 'express';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ZodType } from 'zod';
import { AppError } from '../errors/AppError';

function formatErrors(errors: ValidationError[]): Record<string, string[]> {
  return Object.fromEntries(errors.map((e) => [e.property, Object.values(e.constraints ?? {})]));
}

/** Valida e transforma req.body em uma instância do DTO (class-validator). */
export function validateBody<T extends object>(dto: ClassConstructor<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const instance = plainToInstance(dto, req.body ?? {});
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      throw new AppError('Dados inválidos', 400, formatErrors(errors));
    }

    req.body = instance;
    next();
  };
}

/**
 * Valida req.params / req.query com zod. No Express 5 req.query é somente leitura,
 * então o resultado tipado fica em res.locals.params / res.locals.query.
 */
export function validateRequest(schemas: { params?: ZodType; query?: ZodType }) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) res.locals.params = schemas.params.parse(req.params);
    if (schemas.query) res.locals.query = schemas.query.parse(req.query);
    next();
  };
}
