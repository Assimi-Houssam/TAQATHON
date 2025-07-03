import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { Document } from './entities/doc.entity';
import { DocumentType } from './enum/doc.enum';
import { Readable } from 'stream';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private storageService: StorageService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    userId: number,
    description?: string,
    doc_type?: DocumentType,
  ): Promise<Document> {
    let documentId: string;
    let existingDocument: Document | null;

    do {
      documentId = uuidv4();
      existingDocument = await this.documentRepository.findOne({
        where: { id: documentId },
      });
    } while (existingDocument);

    const uploadResult = await this.storageService.uploadFile(file, documentId);

    const document = this.documentRepository.create({
      id: documentId,
      fileName: uploadResult.fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      description,
      uploadedById: userId,
      isLinked: true, // TODO: remove this field
      type: doc_type,
    });

    return this.documentRepository.save(document);
  }

  async getDocumentStream(
    id: string,
  ): Promise<{ stream: Readable; document: Document }> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    console.log(document);
    const { stream } = await this.storageService.getFile(document.fileName);

    // Ensure stream is a Node.js Readable stream
    if (!(stream instanceof Readable)) {
      throw new Error('Invalid stream type');
    }

    return { stream, document };
  }

  async deleteDocument(id: string, userId: number): Promise<void> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user has permission to delete
    if (document.uploadedById !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this document',
      );
    }

    // Remove the association with the user
    document.uploadedById = null;
    await this.documentRepository.save(document);
  }

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Add more as needed
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async getAvatarFile(
    id: string,
  ): Promise<{ stream: Readable; document: Document }> {
    const document = await this.documentRepository.findOne({
      where: { id }, // TODO: add type: DocumentType.AVATAR
    });
    if (!document) {
      throw new NotFoundException('Avatar not found');
    }

    const { stream } = await this.storageService.getFile(document.fileName);

    if (!(stream instanceof Readable)) {
      throw new Error('Invalid stream type');
    }

    return { stream, document };
  }
}
