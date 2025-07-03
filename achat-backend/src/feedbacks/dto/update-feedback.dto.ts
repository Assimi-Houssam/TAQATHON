import { z } from 'zod';
import { createZodDto } from 'utils/zod-dto';

export const UpdateFeedbackSchema = z
  .object({
    title: z.string().min(1).max(50).optional(),
    description: z.string().min(5).max(500).optional(),
    rating: z.number().int().min(1).max(5).optional(),
  })
  .refine((data) => Object.keys(data).length > 0);

export class UpdateFeedbackDto extends createZodDto(UpdateFeedbackSchema) {}
