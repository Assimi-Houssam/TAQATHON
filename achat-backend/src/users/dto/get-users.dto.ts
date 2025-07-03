import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { paginationSchema } from 'src/common/dto/pagination.dto';

export const getUsersSchema = z.object({
  ...paginationSchema.shape,
  search: z.string().optional(),
  sort: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const parts = val.split(':');
        if (parts.length !== 2) return false;
        const [field, order] = parts;
        return (
          ['first_name', 'last_name', 'email'].includes(field) &&
          ['ASC', 'DESC'].includes(order?.toUpperCase() || '')
        );
      },
      {
        message: 'Invalid sort format. Use field:order (e.g., first_name:ASC)',
      },
    ),
  departements: z
    .string()
    .transform((val) => val.split(',').map(Number))
    .pipe(z.array(z.number()))
    .optional(),
});

export class GetUsersDto extends createZodDto(getUsersSchema) {}
