import { z } from 'zod';

export const CreateRegionSchema = z.object({
  province: z.string().max(100),
  region_name: z.string().max(50),
});

export type CreateRegionDTO = z.infer<typeof CreateRegionSchema>;
