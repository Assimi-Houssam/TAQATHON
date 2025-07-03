import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const inviteUsersSchema = z.object({
  user_ids: z
    .array(z.number().positive().int())
    .nonempty()
    .refine((ids) => new Set(ids).size === ids.length),
});

export class InviteUsersDto extends createZodDto(inviteUsersSchema) {}
