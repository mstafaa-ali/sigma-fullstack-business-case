import { z } from 'zod';
import { CreateStoreSchema } from './create-store.dto';

export const UpdateStoreSchema = CreateStoreSchema.partial();

export type UpdateStoreDTO = z.infer<typeof UpdateStoreSchema>;
