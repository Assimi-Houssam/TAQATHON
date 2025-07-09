import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';

@Module({
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService], // Export if other modules need it
})
export class CronModule {}
