import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export enum Event {
  'ACCEPT' = 'ACCEPT',
  'REJECT' = 'REJECT',
}

export const updateUserStatusSchema = z.object({
  user_id: z.number().positive().int(),
  event: z.nativeEnum(Event),
});

export class UpdateUserStatusDto extends createZodDto(updateUserStatusSchema) {}
