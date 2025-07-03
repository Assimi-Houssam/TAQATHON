import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';

export const createReportSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(5).max(1000),
});

export class CreateReportDto extends createZodDto(createReportSchema) {}
