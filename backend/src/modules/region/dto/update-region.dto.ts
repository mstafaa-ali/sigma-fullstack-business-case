import { z } from 'zod';
import { CreateRegionSchema } from './create-region.dto';

export const UpdateRegionSchema = CreateRegionSchema.partial();

export type UpdateRegionDTO = z.infer<typeof UpdateRegionSchema>;
