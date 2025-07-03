import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from 'configs/data-source.config';
import { AuthModule } from './auth/auth.module';
import { BidsModule } from './bids/bids.module';
import { ChatModule } from './chats/chats.module';
import { CompaniesModule } from './companies/companies.module';
import { DatabaseModule } from './database/database.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { FormsModule } from './forms/forms.module';
import { LogsModule } from './logs/logs.module';
import { MailModule } from './mail/mail.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PurchaseRequestsModule } from './purchase-requests/purchase-requests.module';
import { SessionModule } from './session/session.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { QueuesModule } from './queues/queues.module';
import { DepartementsModule } from './departements/departements.module';
import { SearchModule } from './search/search.module';
import { TasksController } from './tasks/tasks.controller';
import { TasksModule } from './tasks/tasks.module';
import { TasksService } from './tasks/tasks.service';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceConfig),
    DatabaseModule,
    QueuesModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      //   signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      signOptions: { expiresIn: '10d' }, // temporary
    }),
    UsersModule,
    AuthModule,
    PurchaseRequestsModule,
    LogsModule,
    FeedbacksModule,
    ChatModule,
    MessagesModule,
    NotificationsModule,
    BidsModule,
    CompaniesModule,
    FormsModule,
    MailModule,
    StorageModule,
    SessionModule,
    SearchModule,
    TasksModule,
    DepartementsModule,
    ReportsModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class AppModule {}
