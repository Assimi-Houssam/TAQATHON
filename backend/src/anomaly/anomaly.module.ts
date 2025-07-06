import { Module } from '@nestjs/common';
import { AnomalyService } from './anomaly.service';
import { AnomalyController } from './anomaly.controller';
import { PythonExecutorService } from './python,service';

@Module({
  controllers: [AnomalyController],
  providers: [AnomalyService, PythonExecutorService],
})
export class AnomalyModule {}
