import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationStatus } from './enums/notification.enum';
import { User } from '../users/entities/user.entity';
import { NotificationFactory } from './factories/notification.factory';
import { NotificationDispatcher } from './dispatchers/notification.dispatcher';
import { NotificationPayload } from 'types/notification.type';
@Injectable()
export class NotificationsService {
  private readonly logger: Logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationFactory: NotificationFactory,
    private notificationDispatcher: NotificationDispatcher,
  ) {}

  async createAndSendNotification(
    payload: NotificationPayload,
  ): Promise<Notification> {
    try {
      const notification = this.notificationFactory.create(payload);

      const savedNotification =
        await this.notificationRepository.save(notification);
      this.logger.log(`Notification created with ID: ${savedNotification.id}`);

      await this.notificationDispatcher.dispatch(notification);

      return savedNotification;
    } catch (error) {
      this.logger.error(
        `Failed to create and send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserNotifications(user: User): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { creator: { id: user.id } },
      order: { created_at: 'DESC' },
    });
  }

  async markAllNotificationsAsRead(creator: User): Promise<void> {
    await this.notificationRepository.update(
      {
        creator: { id: creator.id },
        notification_status: NotificationStatus.UNREAD,
      },
      { notification_status: NotificationStatus.READ },
    );

    this.logger.log(`Marked all notifications as read for user ${creator.id}`);
  }
}
