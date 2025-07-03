import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestChatService } from 'src/chats/services/purchase-request-chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { Company } from 'src/companies/entities/company.entity';
import { ChatModule } from 'src/chats/chats.module';
import { SessionService } from 'src/session/session.service';
import { Departement } from 'src/departements/entities/departement.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseRequest, Company, Departement]),
    DatabaseModule,
    NotificationsModule,
    LogsModule,
    ChatModule,
    MailModule,
  ],
  controllers: [PurchaseRequestsController],
  providers: [
    PurchaseRequestsService,
    PurchaseRequestChatService,
    SessionService,
  ],
  exports: [PurchaseRequestsService],
})
export class PurchaseRequestsModule {}
