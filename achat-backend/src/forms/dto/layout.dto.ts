import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const layoutGroupSchema = z.object({
  id: z.string().min(1, 'Group ID cannot be empty'),
  title: z.string().min(1, 'Group title cannot be empty'),
  columns: z.number().int().min(1).max(12),
  spacing: z.number().int().min(0).max(12),
  formfieldIds: z.array(z.number().int()),
});

export const layoutSchema = z.object({
  formName: z.string().min(1, 'Form name cannot be empty'),
  layout: z.object({
    groups: z
      .array(layoutGroupSchema)
      .min(1, 'Layout must contain at least one group'),
  }),
});

export type LayoutDto = z.infer<typeof layoutSchema>;
export class SaveLayoutDto extends createZodDto(layoutSchema) {}
