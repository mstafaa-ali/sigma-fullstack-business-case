import { z } from 'zod';

export const CreateColumnMappingSchema = z.object({
  file_type: z.enum(['DAILY', 'MP', 'PRODUK']),
  source_column: z.string().max(100),
  internal_field: z.string().max(100),
});

export type CreateColumnMappingDTO = z.infer<typeof CreateColumnMappingSchema>;
