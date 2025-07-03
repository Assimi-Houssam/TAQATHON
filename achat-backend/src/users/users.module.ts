import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { SupplierRestrictionService } from './services/supplier-restriction.service';
import { LogsModule } from '../logs/logs.module';
import { MailModule } from '../mail/mail.module';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { OnlineStatusGateway } from './gateways/online-status.gateway';
import { DocumentModule } from 'src/documents/doc.module';
import { Task } from 'src/tasks/entities/task.entity';
import { CompaniesModule } from 'src/companies/companies.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, Task]),
    LogsModule,
    MailModule,
    SessionModule,
    AuthModule,
    DocumentModule,
    CompaniesModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ConfigService,
    SupplierRestrictionService,
    AuthService,
    OnlineStatusGateway,
  ],
  exports: [UsersService],
})
export class UsersModule {}
