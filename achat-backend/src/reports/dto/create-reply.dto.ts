import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const createReplySchema = z.object({
  message: z.string().min(1).max(500),
});

export class CreateReplyDto extends createZodDto(createReplySchema) {}
