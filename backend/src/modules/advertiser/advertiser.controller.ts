import { BaseController } from '../shared/base.controller';
import { Advertiser, advertiserRepository } from './advertiser.repository';
import { AdvertiserService } from './advertiser.service';
import { CreateAdvertiserDTO, CreateAdvertiserSchema } from './dto/create-advertiser.dto';
import { UpdateAdvertiserDTO, UpdateAdvertiserSchema } from './dto/update-advertiser.dto';
import { Request, Response, NextFunction } from 'express';

export class AdvertiserController extends BaseController<Advertiser, CreateAdvertiserDTO, UpdateAdvertiserDTO> {
  constructor(private advertiserService: AdvertiserService) {
    super(advertiserService, CreateAdvertiserSchema, UpdateAdvertiserSchema);
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
      if (error.message === 'Advertiser with this source_adv already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const advertiserController = new AdvertiserController(new AdvertiserService(advertiserRepository));
