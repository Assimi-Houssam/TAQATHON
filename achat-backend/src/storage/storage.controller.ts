import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageThrottleGuard } from './guards/throttle.guard';
import { StorageService } from './storage.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(StorageThrottleGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload a file', 
    description: 'Upload a file to MinIO storage with size and type validation'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 422, description: 'Invalid file type or size (max 5MB)' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|pdf|doc|docx)$/, // Add allowed file types
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB limit
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.storageService.uploadFile(file);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('presigned-url')
  @ApiOperation({ 
    summary: 'Generate presigned URL', 
    description: 'Generate a presigned URL for client-side file upload'
  })
  @ApiResponse({ status: 201, description: 'Presigned URL generated successfully' })
  @ApiResponse({ status: 400, description: 'File name is required' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async getPresignedUrl(@Body() body: { fileName: string }) {
    try {
      if (!body.fileName) {
        throw new Error('File name is required');
      }
      const { presignedUrl, fileName } =
        await this.storageService.generatePresignedUrl(body.fileName);
      return { presignedUrl, fileName };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
