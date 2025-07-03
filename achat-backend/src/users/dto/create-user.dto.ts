import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { passwordSchema } from './schemas/password-schema';
import { phoneSchema } from './schemas/phone-schema';

export const createUserSchema = z.object({
  first_name: z.string().min(3).max(20),
  last_name: z.string().min(3).max(20),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: passwordSchema(),
  phone_number: phoneSchema(),
  title: z.string(),
  bio: z.string().max(500).optional(),
  address: z.string().max(500).optional(),
  postal_city: z.string().max(50).optional(),
  postal_country: z.string().max(50).optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
