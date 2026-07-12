import { BaseController } from '../shared/base.controller';
import { ColumnMapping, columnMappingRepository } from './column-mapping.repository';
import { ColumnMappingService } from './column-mapping.service';
import { CreateColumnMappingDTO, CreateColumnMappingSchema } from './dto/create-column-mapping.dto';
import { UpdateColumnMappingDTO, UpdateColumnMappingSchema } from './dto/update-column-mapping.dto';
import { Request, Response, NextFunction } from 'express';

export class ColumnMappingController extends BaseController<ColumnMapping, CreateColumnMappingDTO, UpdateColumnMappingDTO> {
  constructor(private columnMappingService: ColumnMappingService) {
    super(columnMappingService, CreateColumnMappingSchema, UpdateColumnMappingSchema);
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
      if (error.message === 'Column mapping for this file_type and source_column already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const columnMappingController = new ColumnMappingController(new ColumnMappingService(columnMappingRepository));
