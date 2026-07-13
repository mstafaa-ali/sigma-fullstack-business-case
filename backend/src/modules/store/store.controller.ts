import { BaseController } from '../shared/base.controller';
import { Store, storeRepository } from './store.repository';
import { StoreService } from './store.service';
import { CreateStoreDTO, CreateStoreSchema } from './dto/create-store.dto';
import { UpdateStoreDTO, UpdateStoreSchema } from './dto/update-store.dto';
import { Request, Response, NextFunction } from 'express';

export class StoreController extends BaseController<Store, CreateStoreDTO, UpdateStoreDTO> {
  constructor(private storeService: StoreService) {
    super(storeService, CreateStoreSchema, UpdateStoreSchema);
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
      if (error.message === 'Store with this source_toko already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const storeController = new StoreController(new StoreService(storeRepository));
