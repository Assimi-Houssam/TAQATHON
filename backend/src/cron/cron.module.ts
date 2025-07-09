import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { PrismaService } from '../prisma.service'; // Import PrismaService

@Module({
  controllers: [CronController],
  providers: [CronService, PrismaService], // Add PrismaService to providers
  exports: [CronService],
})
export class CronModule {}
