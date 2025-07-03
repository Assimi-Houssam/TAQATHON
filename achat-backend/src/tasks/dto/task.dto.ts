import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { paginationSchema } from 'src/common/dto/pagination.dto';

export const getTasksSchema = z.object({
  ...paginationSchema.shape,
});

export class GetTasksDto extends createZodDto(getTasksSchema) {}


// Create Task Schema
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
