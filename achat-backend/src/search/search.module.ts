import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Report } from 'src/reports/entities/report.entity';
import { SessionService } from 'src/session/session.service';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PurchaseRequest, Company, Report]),
    LogsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, SessionService],
  exports: [SearchService],
})
export class SearchModule {}
