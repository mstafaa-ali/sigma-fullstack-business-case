import { z } from 'zod';

export const CreatePlatformSchema = z.object({
  source_kanal: z.string().max(100),
  platform_name: z.string().max(100),
  payment_type: z.string().max(50),
});

export type CreatePlatformDTO = z.infer<typeof CreatePlatformSchema>;
