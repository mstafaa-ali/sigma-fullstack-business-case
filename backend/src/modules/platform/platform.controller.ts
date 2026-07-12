import { BaseController } from '../shared/base.controller';
import { Platform, platformRepository } from './platform.repository';
import { PlatformService } from './platform.service';
import { CreatePlatformDTO, CreatePlatformSchema } from './dto/create-platform.dto';
import { UpdatePlatformDTO, UpdatePlatformSchema } from './dto/update-platform.dto';
import { Request, Response, NextFunction } from 'express';

export class PlatformController extends BaseController<Platform, CreatePlatformDTO, UpdatePlatformDTO> {
  constructor(private platformService: PlatformService) {
    super(platformService, CreatePlatformSchema, UpdatePlatformSchema);
  }

  // Override create to handle 409 Conflict
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let data = req.body;
      if (this.createSchema) {
        data = this.createSchema.parse(data);
      }
      const result = await this.service.create(data);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Platform with this source_kanal already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const platformController = new PlatformController(new PlatformService(platformRepository));
