import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentModule } from 'src/documents/doc.module';
import { Document } from 'src/documents/entities/doc.entity';
import { FormsService } from 'src/forms/forms.service';
import { LogsModule } from 'src/logs/logs.module';
import { SessionService } from 'src/session/session.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { BusinessScope } from './entities/business-scope.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, BusinessScope, Document]),
    LogsModule,
    DocumentModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, SessionService, FormsService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
