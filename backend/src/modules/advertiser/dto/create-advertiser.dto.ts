import { z } from 'zod';

export const CreateAdvertiserSchema = z.object({
  source_adv: z.string().max(100),
  advertiser_name: z.string().max(100),
  store_id: z.number().int().optional().nullable(),
});

export type CreateAdvertiserDTO = z.infer<typeof CreateAdvertiserSchema>;
