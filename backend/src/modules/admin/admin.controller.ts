import { BaseController } from '../shared/base.controller';
import { Admin, adminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { CreateAdminDTO, CreateAdminSchema } from './dto/create-admin.dto';
import { UpdateAdminDTO, UpdateAdminSchema } from './dto/update-admin.dto';
import { Request, Response, NextFunction } from 'express';

export class AdminController extends BaseController<Admin, CreateAdminDTO, UpdateAdminDTO> {
  constructor(private adminService: AdminService) {
    super(adminService, CreateAdminSchema, UpdateAdminSchema);
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
      if (error.message === 'Admin with this admin_name already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const adminController = new AdminController(new AdminService(adminRepository));
