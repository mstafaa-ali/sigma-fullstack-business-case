import { z } from 'zod';
import { CreatePlatformSchema } from './create-platform.dto';

export const UpdatePlatformSchema = CreatePlatformSchema.partial();

export type UpdatePlatformDTO = z.infer<typeof UpdatePlatformSchema>;
