import { Module } from '@nestjs/common';
import { LogsModule } from 'src/logs/logs.module';
import { SessionService } from 'src/session/session.service';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';

@Module({
  imports: [LogsModule],
  providers: [FormsService, SessionService],
  controllers: [FormsController],
})
export class FormsModule {}
