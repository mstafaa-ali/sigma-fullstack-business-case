import { z } from 'zod';

export const UploadFilesSchema = z.object({
  files: z.array(z.object({
    originalname: z.string(),
    mimetype: z.string().refine(
      (m) => [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(m),
      { message: 'Only Excel files are allowed' }
    ),
    size: z.number().max(50 * 1024 * 1024, 'File too large (max 50MB)'),
    path: z.string(),
  })).min(3, 'Exactly 3 files required').max(3, 'Exactly 3 files required'),
});

export type UploadFilesDTO = z.infer<typeof UploadFilesSchema>;
