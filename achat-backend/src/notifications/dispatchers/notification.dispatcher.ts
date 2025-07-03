import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from '../notifications.gateway';
import { Notification } from '../entities/notification.entity';
import { NotificationRecipient } from 'types/notification.type';

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(readonly gateway: NotificationsGateway) {}

  async dispatch(notification: Notification): Promise<void> {
    try {
      if (notification.is_public) {
        await this.dispatchToPublic(notification);
        return;
      }

      if (notification.users?.length > 0) {
        await this.dispatchToUsers(notification);
        return;
      }

      await this.dispatchToCreator(notification);
    } catch (error) {
      this.logger.error(
        `Failed to dispatch notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async dispatchToPublic(notification: Notification): Promise<void> {
    this.gateway.sendNotificationToAll(notification);
    this.logger.log(`Public notification sent: ${notification.id}`);
  }

  private async dispatchToUsers(notification: Notification): Promise<void> {
    const recipients: NotificationRecipient[] = notification.users.map(
      (user) => ({ id: user.id }),
    );

    this.gateway.sendNotificationToUsers(
      recipients.map((r) => r.id),
      notification,
    );

    this.logger.log(
      `Notification ${notification.id} sent to ${recipients.length} users`,
    );
  }

  private async dispatchToCreator(notification: Notification): Promise<void> {
    if (!notification.creator) {
      this.logger.warn(`No creator found for notification ${notification.id}`);
      return;
    }

    this.gateway.sendNotificationToUser(notification.creator.id, notification);
    this.logger.log(
      `Notification ${notification.id} sent to creator ${notification.creator.id}`,
    );
  }
}
