import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { SessionService } from 'src/session/session.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Bid } from './entities/bid.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { LogsModule } from 'src/logs/logs.module';
import { ChatModule } from 'src/chats/chats.module';
import { PurchaseRequestChatService } from 'src/chats/services/purchase-request-chat.service';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, PurchaseRequest]),
    NotificationsModule,
    LogsModule,
    MailModule,
    ChatModule,
  ],
  providers: [BidsService, SessionService, PurchaseRequestChatService],
  controllers: [BidsController],
  exports: [BidsService],
})
export class BidsModule {}
