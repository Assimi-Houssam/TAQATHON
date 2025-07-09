import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MlApiModule } from './ml_api/ml_api.module';
import { AnomalyModule } from './anomaly/anomaly.module';
import { KpiModule } from './kpi/kpi.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [AuthModule, MlApiModule, AnomalyModule, KpiModule, CronModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
