import { z } from 'zod';

export const createAnswerSchema = z.object({
  content: z.string().min(1, 'Answer content cannot be empty'),
  formfieldId: z
    .number()
    .int()
    .positive('Form field ID must be a positive integer'),
  companyId: z
    .number()
    .int()
    .positive('Company ID must be a positive integer')
    .optional(),
  file: z.string().optional(),
});

export type CreateAnswerDto = z.infer<typeof createAnswerSchema>;
