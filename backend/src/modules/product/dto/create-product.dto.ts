import { z } from 'zod';

export const BundleItemSchema = z.object({
  item_code: z.string().max(50),
  item_name: z.string().max(200),
  sort_order: z.number().int().optional(),
});

export const CreateProductSchema = z.object({
  product_code: z.string().max(50),
  product_name: z.string().max(200),
  category: z.enum(['single', 'bundle']),
  bundle_items: z.array(BundleItemSchema).optional(),
}).refine(data => {
  if (data.category === 'bundle' && (!data.bundle_items || data.bundle_items.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Bundle products must have at least one bundle item",
  path: ["bundle_items"],
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
