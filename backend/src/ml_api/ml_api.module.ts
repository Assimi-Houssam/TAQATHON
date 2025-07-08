import { Module } from '@nestjs/common';
import { MlApiService } from './ml_api.service';
import { MlApiController } from './ml_api.controller';
import { PythonExecutorService } from 'src/anomaly/python.service';

@Module({
  controllers: [MlApiController],
  providers: [MlApiService, PythonExecutorService],
})
export class MlApiModule {}
