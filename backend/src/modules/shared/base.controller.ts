import { Request, Response, NextFunction } from 'express';
import { BaseService } from './base.service';
import { z } from 'zod';

export abstract class BaseController<T, CreateDTO, UpdateDTO> {
  constructor(
    protected readonly service: BaseService<T, CreateDTO, UpdateDTO>,
    protected readonly createSchema?: z.ZodType<any, any>,
    protected readonly updateSchema?: z.ZodType<any, any>
  ) {}

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, orderBy, order } = req.query;
      const result = await this.service.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        orderBy: orderBy as string,
        order: order as 'asc' | 'desc',
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.findById(Number(id));
      if (!result) {
        res.status(404).json({ success: false, error: { message: 'Not found' } });
        return;
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let data = req.body;
      if (this.createSchema) {
        data = this.createSchema.parse(data);
      }
      const result = await this.service.create(data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      let data = req.body;
      if (this.updateSchema) {
        data = this.updateSchema.parse(data);
      }
      const result = await this.service.update(Number(id), data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
