import { z } from 'zod';
import { createZodDto } from 'utils/zod-dto';
import { paginationSchema } from 'src/common/dto/pagination.dto';

export const getBidsSchema = z.object({
  ...paginationSchema.shape,
  query: z.string().min(1).max(100).optional(),
});

export class GetBidsDto extends createZodDto(getBidsSchema) {}
