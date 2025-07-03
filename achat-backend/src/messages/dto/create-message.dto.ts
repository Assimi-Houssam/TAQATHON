import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const createMessageSchema = z.object({
  sender_id: z.number().positive().int(),
  content: z.string().min(1).max(500),
});

export const messagePayloadSchema = z.object({
  chat_id: z.number().positive().int(),
  message: createMessageSchema,
});

export class CreateMessageDto extends createZodDto(createMessageSchema) {}
