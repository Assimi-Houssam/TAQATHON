import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const createCompanyChatSchema = z.object({
  chat_name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[\w\s\-'",.!?()]+$/)
    .trim().optional(),
  chat_description: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[\w\s\-'",.!?()]+$/)
    .trim(),
  company_id: z.number().positive().int(),
});

export class CreateCompanyChatDto extends createZodDto(createCompanyChatSchema) {}
