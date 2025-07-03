import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { SessionService } from 'src/session/session.service';
import { LogsService } from 'src/logs/logs.service';
@Module({
  providers: [MessagesService, SessionService, LogsService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
