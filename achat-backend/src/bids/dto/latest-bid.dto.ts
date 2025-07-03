import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { BidStatus } from '../enums/bids.enum';

export const latestBidsSchema = z.object({
  id: z.number(),
  bid_reference: z.string(),
  bid_status: z.nativeEnum(BidStatus),
  bid_description: z.string(),
  delivery_date: z.date(),
  delivery_address: z.string(),
  biding_date: z.date(),
  biding_address: z.string(),
  company: z.object({
    id: z.number(),
    legal_name: z.string(),
    company_phone: z.string(),
    email: z.string(),
    address: z.string(),
  }),
  created_at: z.date(),
  updated_at: z.date(),
});

export class LatestBidsDto extends createZodDto(latestBidsSchema) {}
