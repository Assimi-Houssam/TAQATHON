import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const createFeedbackSchema = z.object({
  description: z.string().min(5).max(500),
  rating: z.number().int().min(1).max(5),
  supplierId: z.number().int(),
  purchaseRequestId: z.number().int().nonnegative(),
});

export class CreateFeedbackDto extends createZodDto(createFeedbackSchema) {}
