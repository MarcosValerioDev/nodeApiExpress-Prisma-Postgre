import { Request, Response } from 'express';
import { authService } from './auth.service';
import { LoginDto } from './dto/login.dto';

export const authController = {
  async login(req: Request<{}, {}, LoginDto>, res: Response) {
    res.json(await authService.login(req.body));
  },
};
