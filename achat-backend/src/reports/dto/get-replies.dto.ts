import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { paginationSchema } from 'src/common/dto/pagination.dto';

export const getRepliesSchema = z.object({
    ...paginationSchema.shape,
});

export class GetRepliesDto extends createZodDto(getRepliesSchema) {}