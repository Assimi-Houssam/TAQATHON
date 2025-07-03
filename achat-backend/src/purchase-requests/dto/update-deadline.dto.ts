import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const updateDeadlineSchema = z.object({
  bidding_deadline: z.coerce.date(),
});

export class UpdateDeadlineDto extends createZodDto(updateDeadlineSchema) {}
