import { z } from 'zod';
import { BundleItemSchema, CreateProductSchema } from './create-product.dto';

export const UpdateProductSchema = z.object({
  product_name: z.string().max(200).optional(),
  category: z.enum(['single', 'bundle']).optional(),
  bundle_items: z.array(BundleItemSchema).optional(),
});

export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;
