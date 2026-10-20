import { Router } from 'express';
import { usersController } from './users.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { listUsersQuerySchema, userIdParamsSchema } from './users.schemas';
import { validateBody, validateRequest } from '../../middlewares/validate';
import { authenticate, onlySelf } from '../../middlewares/auth';
import { authLimiter } from '../../middlewares/rateLimit';

export const usersRouter = Router();

// Cadastro público
usersRouter.post('/', authLimiter, validateBody(CreateUserDto), usersController.create);

// Daqui pra baixo exige JWT
usersRouter.use(authenticate);

usersRouter.get('/', validateRequest({ query: listUsersQuerySchema }), usersController.list);
usersRouter.get('/me', usersController.me);
usersRouter.get('/:id', validateRequest({ params: userIdParamsSchema }), usersController.findById);
usersRouter.patch(
  '/:id',
  validateRequest({ params: userIdParamsSchema }),
  onlySelf,
  validateBody(UpdateUserDto),
  usersController.update,
);
usersRouter.delete('/:id', validateRequest({ params: userIdParamsSchema }), onlySelf, usersController.remove);
