import { Module } from '@nestjs/common';
import { MlApiService } from './ml_api.service';
import { MlApiController } from './ml_api.controller';

@Module({
  controllers: [MlApiController],
  providers: [MlApiService],
})
export class MlApiModule {}
