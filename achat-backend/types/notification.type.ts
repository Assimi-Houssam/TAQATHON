import { User } from 'src/users/entities/user.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { NotificationType } from 'src/notifications/enums/notification.enum';

export interface NotificationPayload {
  type: NotificationType;
  creator: User;
  message: string;
  isPublic: boolean;
  users?: User[];
  bid?: Bid;
  purchaseRequest?: PurchaseRequest;
}

export interface NotificationRecipient {
  id: number;
  socketId?: string;
}
