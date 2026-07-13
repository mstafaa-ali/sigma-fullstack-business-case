import { z } from 'zod';

export const CreateStoreSchema = z.object({
  source_toko: z.string().max(100),
  store_name: z.string().max(100),
  platform_id: z.number().int().optional().nullable(),
});

export type CreateStoreDTO = z.infer<typeof CreateStoreSchema>;
