import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationFactory } from './factories/notification.factory';
import { NotificationDispatcher } from './dispatchers/notification.dispatcher';
import { SessionService } from 'src/session/session.service';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), LogsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationFactory,
    NotificationDispatcher,
    SessionService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
