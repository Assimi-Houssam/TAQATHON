import { Module } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { ChatController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { PurchaseRequestChatService } from './services/purchase-request-chat.service';
import { UsersModule } from 'src/users/users.module';
import { SessionService } from 'src/session/session.service';
import { LogsModule } from 'src/logs/logs.module';
@Module({
  imports: [TypeOrmModule.forFeature([Chat, User]), LogsModule, UsersModule],
  controllers: [ChatController],
  providers: [
    {
      provide: ChatService,
      useClass: ChatService,
    },
    {
      provide: ChatsGateway,
      useClass: ChatsGateway,
    },
    MessagesService,
    PurchaseRequestChatService,
    SessionService,
  ],
  exports: [ChatService, PurchaseRequestChatService],
})
export class ChatModule {}
