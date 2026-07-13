import { BaseController } from '../shared/base.controller';
import { Region, regionRepository } from './region.repository';
import { RegionService } from './region.service';
import { CreateRegionDTO, CreateRegionSchema } from './dto/create-region.dto';
import { UpdateRegionDTO, UpdateRegionSchema } from './dto/update-region.dto';
import { Request, Response, NextFunction } from 'express';

export class RegionController extends BaseController<Region, CreateRegionDTO, UpdateRegionDTO> {
  constructor(private regionService: RegionService) {
    super(regionService, CreateRegionSchema, UpdateRegionSchema);
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let data = req.body;
      if (this.createSchema) {
        data = this.createSchema.parse(data);
      }
      const result = await this.service.create(data);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Region with this province already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const regionController = new RegionController(new RegionService(regionRepository));
