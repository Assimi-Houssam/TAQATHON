import { Module } from '@nestjs/common';
import { MlApiService } from './ml_api.service';
import { MlApiController } from './ml_api.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MlApiController],
  providers: [MlApiService, PrismaService],
})
export class MlApiModule {}
