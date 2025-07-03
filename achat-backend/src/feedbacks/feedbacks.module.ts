import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { Feedback } from './entities/feedback.entity';
import { Company } from 'src/companies/entities/company.entity';
import { User } from 'src/users/entities/user.entity';
import { Log } from 'src/logs/entities/log.entity';
import { BusinessScope } from 'src/companies/entities/business-scope.entity';
import { MailModule } from 'src/mail/mail.module';
import { DocumentModule } from 'src/documents/doc.module';
import { Document } from 'src/documents/entities/doc.entity';
import { UsersModule } from 'src/users/users.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { LogsModule } from 'src/logs/logs.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SessionModule } from 'src/session/session.module';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feedback,
      Company,
      User,
      Log,
      BusinessScope,
      Document,
    ]),
    TypeOrmModule.forFeature([
      Feedback,
      Company,
      User,
      Log,
      BusinessScope,
      PurchaseRequest,
    ]),
    UsersModule,
    CompaniesModule,
    LogsModule,
    NotificationsModule,
    MailModule,
    DocumentModule,
    SessionModule,
  ],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
