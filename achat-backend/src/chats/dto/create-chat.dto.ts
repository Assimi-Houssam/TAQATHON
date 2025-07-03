import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { ChatType } from '../enums/chat.enum';

export const createChatSchema = z.object({
  chat_name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[\w\s\-'",.!?()]+$/)
    .trim(),
  chat_description: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[\w\s\-'",.!?()]+$/)
    .trim(),
  chat_members: z
    .array(z.number().positive().int().gt(0))
    .nonempty()
    .refine((ids) => new Set(ids).size === ids.length),
  chat_type: z.nativeEnum(ChatType),
});

export class CreateChatDto extends createZodDto(createChatSchema) {}
