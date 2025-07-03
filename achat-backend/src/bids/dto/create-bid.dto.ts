import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { BidStatus } from '../enums/bids.enum';

export const createBidSchema = z.object({
  bid_description: z.string().min(5).max(500),
  delivery_address: z.string().min(5).max(100),
  biding_address: z.string().min(5).max(100),
  delivery_date: z.coerce.date(),
  biding_date: z.coerce.date(),
  bid_status: z.nativeEnum(BidStatus).default(BidStatus.PENDING).optional(),
  purchase_request_id: z.number().positive().int().gt(0),
  company_id: z.number().positive().int().gt(0),
});

export const showInerestSchema = z.object({
  purchase_request_id: z.number().nonnegative().int(),
});

export class ShowInterestDto extends createZodDto(showInerestSchema) {}

export class CreateBidDto extends createZodDto(createBidSchema) {}
