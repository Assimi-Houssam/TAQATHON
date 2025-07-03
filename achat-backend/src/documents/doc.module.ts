import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service';
import { SessionService } from 'src/session/session.service';
import { StorageModule } from '../storage/storage.module';
import { DocumentController } from './doc.controller';
import { DocumentService } from './doc.service';
import { Document } from './entities/doc.entity';
import { DocumentDeletionService } from './services/document-deletion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), StorageModule],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    JwtService,
    SessionService,
    LogsService,
    DocumentDeletionService,
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
