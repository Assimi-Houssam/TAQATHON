import { Module } from '@nestjs/common';
import { AnomalyService } from './anomaly.service';
import { AnomalyController } from './anomaly.controller';
import { PythonExecutorService } from './python.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AnomalyController],
  providers: [AnomalyService, PythonExecutorService, PrismaService],
})
export class AnomalyModule {}
