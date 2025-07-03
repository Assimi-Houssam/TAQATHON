import { Chat, Company, Feedback, PurchaseRequest } from "./index";
import { BidStatus } from "./enums/index.enum";

export interface Bid {
  id: number;
  bid_status: BidStatus;
  bid_description: string;
  chat: Chat;
  delivery_date: Date;
  delivery_address: string;
  biding_date: Date;
  biding_address: string;
  feedback: Feedback;
  purchase_request: PurchaseRequest;
  company: Company;
  created_at: Date;
  updated_at: Date;
}
