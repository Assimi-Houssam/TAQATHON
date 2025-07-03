import { z } from 'zod';
import { createZodDto } from 'utils/zod-dto';
import { LogsType } from '../enums/logs.enum';
import { paginationSchema } from 'src/common/dto/pagination.dto';
// Create Log Schema
const createLogSchema = z.object({
  action_type: z.nativeEnum(LogsType),
  previous_status: z.string().optional(),
  action: z.string(),
  user_id: z.number(),
});

// Filter Schema
const logFilterSchema = z.object({
  ...paginationSchema.shape,
  actionType: z.nativeEnum(LogsType).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.number().optional(),
  search: z.string().optional(),
});

// Create DTO classes using the schemas
export class CreateLogDto extends createZodDto(createLogSchema) {}
export class LogFilterDto extends createZodDto(logFilterSchema) {}

// Export schemas for reuse
export { createLogSchema, logFilterSchema };
