import { z } from 'zod';
import { FormFieldType } from '../enums/forms.enum';

// First declare the type shape without the array fields
const baseFormFieldSchema = z.object({
  label: z.string().min(1, 'Field label cannot be empty'),
  description: z.string().optional(),
  tooltip: z.string().optional(),
  type: z.nativeEnum(FormFieldType),
  required: z.boolean().default(false),
  order: z.number().positive('Field order must be a positive integer'),
  formName: z.string().min(1, 'Form name cannot be empty'),
  selectOptions: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  minLength: z.number().int().min(0).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  pattern: z.string().optional(),
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional(),
  maxFileSize: z.number().positive().optional(),
  allowedFileTypes: z.string().optional(),
});

// Then create the nested schema
const nestedFormFieldSchema = z.lazy(() =>
  baseFormFieldSchema
    .extend({
      arrayFields: z.array(z.lazy(() => nestedFormFieldSchema)).optional(),
    })
    .omit({ formName: true }),
);

// Finally create the complete schema with refinements
export const createFormFieldSchema = baseFormFieldSchema
  .extend({
    arrayFields: z.array(nestedFormFieldSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === FormFieldType.MULTIPLE_CHOICE &&
      (!data.selectOptions || !data.selectOptions.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multiple choice fields must have options',
        path: ['selectOptions'],
      });
    }

    switch (data.type) {
      case FormFieldType.TEXT:
        if (
          data.minLength !== undefined &&
          data.maxLength !== undefined &&
          data.minLength > data.maxLength
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Minimum length cannot be greater than maximum length',
            path: ['minLength'],
          });
        }
        break;

      case FormFieldType.NUMBER:
        if (
          data.minValue !== undefined &&
          data.maxValue !== undefined &&
          data.minValue > data.maxValue
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Minimum value cannot be greater than maximum value',
            path: ['minValue'],
          });
        }
        break;

      case FormFieldType.DATE:
        if (
          data.minDate &&
          data.maxDate &&
          new Date(data.minDate) > new Date(data.maxDate)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Minimum date cannot be later than maximum date',
            path: ['minDate'],
          });
        }
        break;

      case FormFieldType.ARRAY:
        if (!data.arrayFields?.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Array fields must have at least one field definition',
            path: ['arrayFields'],
          });
        }
        break;
    }
  });

export type CreateFormFieldDto = z.infer<typeof createFormFieldSchema>;
