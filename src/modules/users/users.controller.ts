import { Request, Response } from 'express';
import { usersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQuery, UserIdParams } from './users.schemas';

export const usersController = {
  async create(req: Request<{}, {}, CreateUserDto>, res: Response) {
    const user = await usersService.create(req.body);
    res.status(201).json(user);
  },

  async list(_req: Request, res: Response) {
    const query = res.locals.query as ListUsersQuery;
    res.json(await usersService.list(query));
  },

  async me(req: Request, res: Response) {
    res.json(await usersService.findById(req.user!.sub));
  },

  async findById(_req: Request, res: Response) {
    const { id } = res.locals.params as UserIdParams;
    res.json(await usersService.findById(id));
  },

  async update(req: Request<{}, {}, UpdateUserDto>, res: Response) {
    const { id } = res.locals.params as UserIdParams;
    res.json(await usersService.update(id, req.body));
  },

  async remove(_req: Request, res: Response) {
    const { id } = res.locals.params as UserIdParams;
    await usersService.remove(id);
    res.status(204).send();
  },
};
