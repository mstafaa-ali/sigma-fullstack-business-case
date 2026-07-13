import { z } from 'zod';

export const ImportSessionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'validating', 'processing', 'transforming', 'generating', 'completed', 'failed']),
  started_at: z.date(),
  completed_at: z.date().nullable(),
  total_rows: z.number().int(),
  processed_rows: z.number().int(),
  success_rows: z.number().int(),
  error_rows: z.number().int(),
  file_names: z.array(z.string()),
  created_by: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ImportSessionDTO = z.infer<typeof ImportSessionSchema>;
