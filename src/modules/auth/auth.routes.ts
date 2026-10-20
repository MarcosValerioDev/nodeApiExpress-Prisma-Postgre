import { Router } from 'express';
import { authController } from './auth.controller';
import { LoginDto } from './dto/login.dto';
import { validateBody } from '../../middlewares/validate';
import { authLimiter } from '../../middlewares/rateLimit';

export const authRouter = Router();

authRouter.post('/login', authLimiter, validateBody(LoginDto), authController.login);
