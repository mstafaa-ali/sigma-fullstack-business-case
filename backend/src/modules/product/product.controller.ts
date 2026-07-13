import { BaseController } from '../shared/base.controller';
import { Product, productRepository } from './product.repository';
import { ProductService } from './product.service';
import { CreateProductDTO, CreateProductSchema } from './dto/create-product.dto';
import { UpdateProductDTO, UpdateProductSchema } from './dto/update-product.dto';
import { Request, Response, NextFunction } from 'express';

export class ProductController extends BaseController<Product, CreateProductDTO, UpdateProductDTO> {
  constructor(private productService: ProductService) {
    super(productService, CreateProductSchema, UpdateProductSchema);
  }

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.productService.findByIdWithBundle(Number(id));
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
      const result = await this.productService.create(data);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Product with this product_code already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const productController = new ProductController(new ProductService(productRepository));
