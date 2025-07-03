import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const inviteToBidSchema = z.object({
  companyIds: z.array(z.number()).min(1),
});

export const inviteToManageSchema = z.object({
  agentId: z.number().min(1),
});

export class InviteToBidDto extends createZodDto(inviteToBidSchema) {}
export class InviteToManageDto extends createZodDto(inviteToManageSchema) {}
