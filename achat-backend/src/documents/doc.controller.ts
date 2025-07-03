import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'decorators/get-user.decorator';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { DocumentService } from './doc.service';
import { DocumentType } from './enum/doc.enum';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDocument(@Param('id') id: string) {
    return this.documentService.getDocumentById(id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or no file uploaded',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB in bytes
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = new Set([
          'application/pdf',
          'application/zip',
          'application/x-zip-compressed',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/x-rar-compressed',
          'application/vnd.rar',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);

        if (!allowedMimeTypes.has(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Invalid file type. Allowed types: PDF, ZIP, XLS, XLSX, CSV, RAR, DOC, DOCX',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Body('description') description?: string,
    @Body('doc_type') doc_type?: DocumentType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const document = await this.documentService.uploadDocument(
      file,
      user.id,
      description,
      doc_type,
    );
    return { id: document.id };
  }

  @Get(':id/download')
  @Public()
  @ApiOperation({ summary: 'Download a document' })
  @ApiResponse({ status: 200, description: 'Document stream' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { stream, document } =
      await this.documentService.getDocumentStream(id);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalName}"`,
    );
    res.setHeader('Content-Length', document.size);

    stream.pipe(res);
  }

  @Get(':id/view')
  @Public()
  @ApiOperation({ summary: 'View a document' })
  @ApiResponse({ status: 200, description: 'Document stream' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async viewFile(@Param('id') id: string, @Res() res: Response) {
    const { stream, document } =
      await this.documentService.getDocumentStream(id);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', document.size);

    stream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not document owner' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteDocument(@Param('id') id: string, @GetUser() user: User) {
    return this.documentService.deleteDocument(id, user.id);
  }

  @Get('avatar/:id')
  @Public()
  @ApiOperation({ summary: 'Get avatar by document ID' })
  @ApiResponse({
    status: 200,
    description: 'Avatar file returned successfully',
  })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  @ApiResponse({ status: 400, description: 'Invalid avatar type' })
  async getAvatar(@Param('id') id: string, @Res() response: Response) {
    try {
      const { stream, document } = await this.documentService.getAvatarFile(id);
      // Cache media files for 1 hour
      response.set({
        'Content-Type': document.mimeType,
        'Content-Length': document.size,
        'Content-Disposition': `inline; filename="${document.originalName}"`,
      });

      stream.pipe(response);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Avatar not found');
    }
  }
}
