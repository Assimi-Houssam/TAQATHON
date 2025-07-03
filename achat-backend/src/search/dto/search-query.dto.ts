import { z } from 'zod';
import { createZodDto } from 'utils/zod-dto';
import { paginationSchema } from 'src/common/dto/pagination.dto';

export const searchQuerySchema = z.object({
  ...paginationSchema.shape,
  query: z.string().min(1).max(100),
});

export class SearchQueryDto extends createZodDto(searchQuerySchema) {}
