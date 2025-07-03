import { FormField } from "./index";
import { Layout } from "./enums/index.enum";

export interface Form {
  id: number;
  name: string;
  description?: string;
  isLocked: boolean;
  formfields: FormField[];
  layout?: Layout;
  createdAt: Date;
  updatedAt: Date;
}
