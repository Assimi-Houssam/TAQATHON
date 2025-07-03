import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { Chat } from 'src/chats/entities/chat.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Answer } from 'src/forms/entities/answer.entity';
import { Form } from 'src/forms/entities/form.entity';
import { FormFieldLocalization } from 'src/forms/entities/formfield-localization.entity';
import { FormField } from 'src/forms/entities/formfield.entity';
import { Log } from 'src/logs/entities/log.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { Session } from 'src/session/entities/session.entity';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Session,
      Notification,
      Bid,
      Feedback,
      Log,
      Message,
      PurchaseRequest,
      Answer,
      Company,
      Chat,
      Form,
      FormField,
      FormFieldLocalization,
      Task,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
