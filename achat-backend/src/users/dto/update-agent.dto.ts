import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { phoneSchema } from './schemas/phone-schema';

export const updateAgentSchema = z.object({
  bio: z.string().max(500).optional(),
  phone_number: phoneSchema().optional(),
  birth_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)))
    .transform((date) => new Date(date))
    .optional(),
});

export class UpdateAgentDto extends createZodDto(updateAgentSchema) {}
