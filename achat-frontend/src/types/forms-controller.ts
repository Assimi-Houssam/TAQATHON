import { z } from "zod";
import { FormFieldType } from "./entities/enums/index.enum";

export const createFormFieldSchema = z.object({
  label: z.string().min(1, "Field label cannot be empty"),
  description: z.string().optional(),
  tooltip: z.string().optional(),
  type: z.nativeEnum(FormFieldType),
  required: z.boolean().default(false),
  order: z.number().positive("Field order must be a positive integer"),
  formName: z.string().min(1, "Form name cannot be empty"),
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

export type CreateFormFieldDto = z.infer<typeof createFormFieldSchema>;

export const createFormSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
});

export type CreateFormDto = z.infer<typeof createFormSchema>;

export interface LayoutConfig {
  groups: {
    id: string;
    title: string;
    columns: number;
    spacing: number;
    formfieldIds: number[];
  }[];
}

// Define a type for the API response
export interface FormResponse {
  id: number;
  name: string;
  description: string;
  layout: LayoutConfig | null;
  isLocked: boolean;
}
