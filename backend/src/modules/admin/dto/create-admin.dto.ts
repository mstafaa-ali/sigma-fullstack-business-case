import { z } from 'zod';

export const CreateAdminSchema = z.object({
  admin_name: z.string().max(100),
  store_id: z.number().int().optional().nullable(),
});

export type CreateAdminDTO = z.infer<typeof CreateAdminSchema>;
