import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MlApiService } from './ml_api.service';
import { Public } from 'src/metadata';
import { CreateAnomalieDto } from 'src/anomaly/dto/anomalie.dto';
import { PrioritySuggestionDto } from './dto/prioritysuggestion.dto';
import { PythonExecutorService } from 'src/anomaly/python.service';

@ApiTags('ml-api')
@Controller('ml')
@Public()
export class MlApiController {
  constructor(
    private readonly mlApiService: MlApiService,
    private readonly pythonExecutorService: PythonExecutorService,
  ) {}

  @ApiOperation({ summary: 'Get priority suggestion for anomaly' })
  @ApiResponse({
    status: 200,
    description: 'Priority suggestion retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        priority: { type: 'string', example: 'HIGH' },
        confidence: { type: 'number', example: 0.95 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @Post('suggestPriority')
  async SuggestPriority(@Body() data: PrioritySuggestionDto) {
    // send data to fastapi for estimation of  priotite
    // receive data from fastapi send it to front
    const response = await this.mlApiService.sendPriorityRequest(data);
    return response;
  }

  @ApiOperation({ summary: 'Upload anomaly file for ML processing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file containing anomaly data',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded and processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or upload failed',
  })
  @Post('uploadanomalies')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resolved',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `resolved-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Validate file type
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return callback(new Error('Only Excel files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadAnomaly(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      const res = await this.mlApiService.sendAnomalyFile(file);
      if (!res || !res) {
        throw new BadRequestException('Failed to process the file');
      }
      return {
        success: true,
        message: 'File uploaded and processed successfully',
        data: res,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @ApiOperation({ summary: 'Receive response from FastAPI ML service' })
  @ApiResponse({
    status: 200,
    description: 'FastAPI response received successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Data received successfully' },
        data: { type: 'object' },
      },
    },
  })
  @Public()
  @Post('receive-fastapi-response')
  async receiveFastApiResponse(@Body() data: CreateAnomalieDto) {
    return { message: 'Data received successfully', data };
  }
}
