import { z } from 'zod';
import { CreatePriceRuleSchema } from './create-price-rule.dto';

export const UpdatePriceRuleSchema = CreatePriceRuleSchema.partial();

export type UpdatePriceRuleDTO = z.infer<typeof UpdatePriceRuleSchema>;
