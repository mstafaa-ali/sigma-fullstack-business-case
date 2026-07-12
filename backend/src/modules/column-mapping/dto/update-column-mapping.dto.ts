import { z } from 'zod';
import { CreateColumnMappingSchema } from './create-column-mapping.dto';

export const UpdateColumnMappingSchema = CreateColumnMappingSchema.partial();

export type UpdateColumnMappingDTO = z.infer<typeof UpdateColumnMappingSchema>;
