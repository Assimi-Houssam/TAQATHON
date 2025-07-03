import { createZodDto } from 'utils/zod-dto';
import { createBidSchema } from './create-bid.dto';

export const updateBidSchema = createBidSchema
  .omit({ purchase_request_id: true })
  .partial()
  .strict();

export class UpdateBidDto extends createZodDto(updateBidSchema) {}
