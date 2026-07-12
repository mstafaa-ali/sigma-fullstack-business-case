import { z } from 'zod';
import { CreateAdminSchema } from './create-admin.dto';

export const UpdateAdminSchema = CreateAdminSchema.partial();

export type UpdateAdminDTO = z.infer<typeof UpdateAdminSchema>;
