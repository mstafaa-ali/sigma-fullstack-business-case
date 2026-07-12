import { BaseController } from '../shared/base.controller';
import { PriceRule, priceRuleRepository } from './price-rule.repository';
import { PriceRuleService } from './price-rule.service';
import { CreatePriceRuleDTO, CreatePriceRuleSchema } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDTO, UpdatePriceRuleSchema } from './dto/update-price-rule.dto';
import { Request, Response, NextFunction } from 'express';

export class PriceRuleController extends BaseController<PriceRule, CreatePriceRuleDTO, UpdatePriceRuleDTO> {
  constructor(private priceRuleService: PriceRuleService) {
    super(priceRuleService, CreatePriceRuleSchema, UpdatePriceRuleSchema);
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
      if (error.message === 'Price rule for this product, platform, and bundle item already exists') {
        res.status(409).json({ success: false, error: { message: error.message } });
        return;
      }
      next(error);
    }
  };
}

export const priceRuleController = new PriceRuleController(new PriceRuleService(priceRuleRepository));
