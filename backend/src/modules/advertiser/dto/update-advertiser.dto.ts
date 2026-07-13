import { z } from 'zod';
import { CreateAdvertiserSchema } from './create-advertiser.dto';

export const UpdateAdvertiserSchema = CreateAdvertiserSchema.partial();

export type UpdateAdvertiserDTO = z.infer<typeof UpdateAdvertiserSchema>;
