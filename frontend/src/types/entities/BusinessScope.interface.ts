import { Company } from ".";

export interface BusinessScope {
  id: number;
  name: string;
  description?: string;
  companies?: Company[];
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}
