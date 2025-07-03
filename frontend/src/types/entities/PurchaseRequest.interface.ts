import { PRVisibilityType, PurchaseRequestStatus } from "./enums/index.enum";
import { Bid, Company, Departement, Document, User } from "./index";

export interface PurchaseRequest {
  id: number;
  request_code: string;
  title: string;
  bidding_deadline: string;
  status: PurchaseRequestStatus;
  description: string;
  buying_department: Departement;
  category: string;
  purchase_visibility: PRVisibilityType;
  delivery_date: string;
  delivery_address: string;
  biding_date: string;
  biding_address: string;
  owner?: User;
  companies?: Company[];
  agents?: User[];
  bids?: Bid[];
  documents?: Document[];
  created_at?: string;
  updated_at?: string;
}
