import { Answer, Form } from "./index";
import { FormFieldType } from "./enums/index.enum";

export interface FormField {
  id: number;
  label: string;
  description?: string;
  tooltip?: string;
  answers: Answer[];
  type: FormFieldType;
  required: boolean;
  selectOptions?: string;
  order: number;
  forms: Form;
  maxLength?: number;
  minLength?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  pattern?: string;
  minDate?: Date;
  maxDate?: Date;
  maxFileSize?: number;
  allowedFileTypes?: string;
  createdAt: Date;
  updatedAt: Date;
}
