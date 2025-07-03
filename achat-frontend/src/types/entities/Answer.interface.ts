import { FormField } from "./index";
import { Company } from "./index";

export interface Answer {
  id: number;
  content: string;
  formfield: FormField;
  company?: Company | null;
  file?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
