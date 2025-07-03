import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Document } from '../entities/doc.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DocumentDeletionService {
  private readonly logger = new Logger(DocumentDeletionService.name);
  private readonly DOCUMENT_EXPIRATION_TIME = 48;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldDocuments() {
    try {
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(
        fortyEightHoursAgo.getHours() - this.DOCUMENT_EXPIRATION_TIME,
      );

      const documentsToDelete = await this.documentRepository
        .createQueryBuilder('document')
        .where('document.isLinked = :isLinked', { isLinked: false })
        .andWhere('document.createdAt <= :date', { date: fortyEightHoursAgo })
        .getMany();

      if (documentsToDelete.length > 0) {
        await this.documentRepository.remove(documentsToDelete);
        this.logger.log(
          `Deleted ${documentsToDelete.length} unlinked documents older than 48 hours`,
        );
      }
    } catch (error) {
      this.logger.error('Error while deleting old documents:', error);
    }
  }
}
