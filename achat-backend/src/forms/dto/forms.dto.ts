import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { layoutSchema } from './layout.dto';

export const createFormSchema = z.object({
  name: z.string().min(1, 'Form name cannot be empty'),
  description: z.string().optional(),
  layout: layoutSchema.optional(),
});

export class CreateFormDto extends createZodDto(createFormSchema) {}
