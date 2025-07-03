import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

const KickUserSchema = z.object({
  user_id: z.number().int().positive(),
});

export class KickUserDto extends createZodDto(KickUserSchema) {}
