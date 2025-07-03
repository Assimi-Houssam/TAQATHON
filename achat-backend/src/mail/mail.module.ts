import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { QueuesModule } from 'src/queues/queues.module';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [ConfigModule, QueuesModule, LogsModule],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
