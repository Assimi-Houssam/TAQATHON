import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private minioClient: Minio.Client;

  constructor(private configService: ConfigService) {
    const minioEndpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const [endPoint, portStr] = minioEndpoint.includes(':') 
      ? minioEndpoint.split(':') 
      : [minioEndpoint, '9000'];
    const port = parseInt(portStr, 10) || 9000;

    this.minioClient = new Minio.Client({
      endPoint: endPoint,
      port: port,
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL') ? true : false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  /**
   * Generates a unique filename using provided UUID or generating a new one
   * @param originalFileName - The original name of the file including extension
   * @param existingUuid - Optional UUID to use instead of generating a new one
   * @returns A unique filename with the original extension
   * @private
   */
  private generateUniqueFileName(
    originalFileName: string,
    existingUuid?: string,
  ): string {
    const fileExtension = originalFileName.split('.').pop();
    const uniqueId = existingUuid || uuidv4();
    return `${uniqueId}.${fileExtension}`;
  }

  /**
   * Generates a pre-signed URL for uploading a file to MinIO storage
   * @param fileName - The original name of the file to be uploaded
   * @param bucketName - The target bucket name (defaults to MINIO_DEFAULT_BUCKET)
   * @returns Object containing the presigned URL and the generated unique filename
   * @throws Error if URL generation fails
   */
  async generatePresignedUrl(
    fileName: string,
    bucketName: string = this.configService.get<string>('MINIO_DEFAULT_BUCKET'),
  ): Promise<{ presignedUrl: string; fileName: string }> {
    try {
      const uniqueFileName = this.generateUniqueFileName(fileName);
      const presignedUrl = await this.minioClient.presignedPutObject(
        bucketName,
        uniqueFileName,
        60 * 60, // URL expires in 1 hour
      );
      return { presignedUrl, fileName: uniqueFileName };
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Retrieves a file from MinIO storage
   * @param fileRef - The reference (name) of the file to retrieve
   * @param bucketName - The bucket name where the file is stored (defaults to MINIO_DEFAULT_BUCKET)
   * @returns Object containing the file stream and file size
   * @throws Error if file retrieval fails
   */
  async getFile(
    fileRef: string,
    bucketName: string = this.configService.get<string>('MINIO_DEFAULT_BUCKET'),
  ): Promise<{ stream: NodeJS.ReadableStream; size: number }> {
    try {
      const stat = await this.minioClient.statObject(bucketName, fileRef);
      const stream = await this.minioClient.getObject(bucketName, fileRef);
      return { stream, size: stat.size };
    } catch (error) {
      throw new Error(`Failed to retrieve file: ${error.message}`);
    }
  }

  /**
   * Deletes a file from MinIO storage
   * @param fileName - The name of the file to delete
   * @param bucketName - The bucket name where the file is stored (defaults to MINIO_DEFAULT_BUCKET)
   * @throws Error if file deletion fails
   */
  async deleteFile(
    fileName: string,
    bucketName: string = this.configService.get<string>('MINIO_DEFAULT_BUCKET'),
  ): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Lists files in MinIO storage with optional prefix filtering
   * @param prefix - Optional prefix to filter files (defaults to empty string)
   * @param recursive - Whether to list files recursively in subdirectories (defaults to true)
   * @param bucketName - The bucket name to list files from (defaults to MINIO_DEFAULT_BUCKET)
   * @returns Array of file names
   * @throws Error if listing files fails
   */
  async listFiles(
    prefix: string = '',
    recursive: boolean = true,
    bucketName: string = this.configService.get<string>('MINIO_DEFAULT_BUCKET'),
  ): Promise<string[]> {
    try {
      const fileList: string[] = [];
      const stream = this.minioClient.listObjects(
        bucketName,
        prefix,
        recursive,
      );

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          fileList.push(obj.name);
        });
        stream.on('end', () => resolve(fileList));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Checks if a file exists in MinIO storage
   * @param fileName - The name of the file to check
   * @param bucketName - The bucket name to check in (defaults to MINIO_DEFAULT_BUCKET)
   * @returns Boolean indicating if the file exists
   * @throws Error if checking file existence fails (except for NotFound errors)
   */
  async doesFileExist(
    fileName: string,
    bucketName: string = this.configService.get<string>('MINIO_DEFAULT_BUCKET'),
  ): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }
  /**
   * Uploads a file directly to MinIO
   * @param file - The file to upload from Multer
   * @param existingUuid - Optional UUID to use for the filename
   * @returns Object containing the uploaded file information
   * @throws Error if upload fails
   */
  async uploadFile(
    file: Express.Multer.File,
    existingUuid?: string,
  ): Promise<{ fileName: string; size: number; mimetype: string }> {
    try {
      const uniqueFileName = this.generateUniqueFileName(
        file.originalname,
        existingUuid,
      );
      const bucketName = this.configService.get<string>('MINIO_DEFAULT_BUCKET');

      await this.minioClient.putObject(
        bucketName,
        uniqueFileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      return {
        fileName: uniqueFileName,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}
