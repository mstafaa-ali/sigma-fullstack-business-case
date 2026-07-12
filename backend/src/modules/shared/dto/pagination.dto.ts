import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? Number(val) : 1)),
  limit: z.string().optional().transform(val => (val ? Number(val) : 20)),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type PaginationQueryDTO = z.infer<typeof PaginationQuerySchema>;
