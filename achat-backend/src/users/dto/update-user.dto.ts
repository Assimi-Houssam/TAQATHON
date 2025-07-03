import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { passwordSchema } from './schemas/password-schema';
import { phoneSchema } from './schemas/phone-schema';

export const updateUserSchema = z.object({
  first_name: z.string().min(3).max(20).optional(),
  last_name: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  password: passwordSchema().optional(),
  phone_number: phoneSchema().optional(),
  age: z.number().min(17).max(90).optional(),
  title: z.string().optional(),
  bio: z.string().max(500).optional(),
  company_name: z.string().min(3).max(20).optional(),
  company_address: z.string().min(3).max(20).optional(),
  company_phone_number: phoneSchema().optional(),
  company_email: z.string().email().optional(),
  birth_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)))
    .transform((date) => new Date(date))
    .optional(),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
