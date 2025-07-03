import { User, Bid, PurchaseRequest } from "./index";
import { NotificationType } from "./enums/index.enum";

export interface Notification {
  id: number;
  notification_type: NotificationType;
  is_public: boolean;
  users?: User[];
  notification_message: string;
  notification_status: string;
  creator?: User;
  bid?: Bid;
  purchase_request?: PurchaseRequest;
  created_at: Date;
  updated_at: Date;
}
