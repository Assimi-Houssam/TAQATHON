import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MlApiModule } from './ml_api/ml_api.module';
import { AnomalyModule } from './anomaly/anomaly.module';

@Module({
  imports: [AuthModule, MlApiModule, AnomalyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
