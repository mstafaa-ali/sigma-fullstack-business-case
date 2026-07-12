import { z } from 'zod';

export const CreatePriceRuleSchema = z.object({
  product_code: z.string().max(50),
  platform_id: z.number().int(),
  bundle_item_code: z.string().max(50).optional().nullable(),
  hpp: z.number().positive(),
});

export type CreatePriceRuleDTO = z.infer<typeof CreatePriceRuleSchema>;
