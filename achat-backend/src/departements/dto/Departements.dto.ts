import { z } from 'zod';

export const createDepartementSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  code: z.string().optional(),
});


export type CreateDepartementDto = z.infer<typeof createDepartementSchema>;

export const updateDepartementSchema = createDepartementSchema.partial();

export type UpdateDepartementDto = z.infer<typeof updateDepartementSchema>;
