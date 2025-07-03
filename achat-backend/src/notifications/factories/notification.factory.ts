import { Injectable } from '@nestjs/common';
import { NotificationStatus } from '../enums/notification.enum';
import { Notification } from '../entities/notification.entity';
import { NotificationPayload } from 'types/notification.type';

@Injectable()
export class NotificationFactory {
  create(payload: NotificationPayload): Notification {
    const notification = new Notification();
    notification.notification_type = payload.type;
    notification.notification_message = payload.message;
    notification.notification_status = NotificationStatus.UNREAD;
    notification.is_public = payload.isPublic;
    notification.creator = payload.creator;
    notification.bid = payload.bid;
    notification.users = payload.users || [];

    if (payload.bid) {
      notification.bid = payload.bid;
    }

    if (payload.purchaseRequest) {
      notification.purchase_request = payload.purchaseRequest;
    }

    return notification;
  }
}
