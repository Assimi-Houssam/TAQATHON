import { Company, User, Bid } from "./index";

export interface Feedback {
  id: number;
  title: string;
  description: string;
  rating: number;
  supplier?: Company;
  agent?: User;
  bid?: Bid;
  created_at: Date;
  updated_at: Date;
}
