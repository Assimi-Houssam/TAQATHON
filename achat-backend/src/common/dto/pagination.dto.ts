import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive()),
});

export class PaginationDto extends createZodDto(paginationSchema) {}
