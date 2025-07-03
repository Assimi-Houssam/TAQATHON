import { Module } from '@nestjs/common';
import { LogsService } from 'src/logs/logs.service';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, LogsService],
  exports: [SessionService],
})
export class SessionModule {}
