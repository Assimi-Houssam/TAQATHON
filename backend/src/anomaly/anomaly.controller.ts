import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { AnomalyService } from './anomaly.service';
import { CreateAnomalieDto, UpdateAnomalieDto } from './dto/anomalie.dto';
import { PythonExecutorService } from './python.service';
import { ForceStopDto } from './dto/forceStop.dto';
import {
  ActionPlanResponseDto,
  CreateActionPlanDto,
} from './dto/actionPlan.dto';
import { Public } from 'src/metadata';

@ApiTags('anomaly')
@Controller('anomaly')
@Public()
export class AnomalyController {
  constructor(
    private readonly anomalyService: AnomalyService,
    private readonly pythonExecutorService: PythonExecutorService,
  ) {}

  @Get('getAnomaly')
  @ApiOperation({ summary: 'Get all anomalies with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description: 'Filter criteria (e.g., asc, desc, low, high, medium)',
  })
  @ApiQuery({
    name: 'section',
    required: false,
    type: String,
    description: 'Filter by source (e.g., "EMC", "APM")',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status (e.g., "NEW", "IN_PROGRESS", "RESOLVED")',
  })
  @ApiQuery({
    name: 'criticity',
    required: false,
    type: String,
    description: 'Filter by criticity (e.g., "HIGH", "MEDIUM", "LOW")',
  })
  @ApiResponse({
    status: 200,
    description: 'List of anomalies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNext: { type: 'boolean' },
        hasPrevious: { type: 'boolean' },
      },
    },
  })
  async getAnomaly(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') orderby: string = 'HIGH',
    @Query('status') status: string = '',
    @Query('criticity') criticity: string = '',
    @Query('section') section: string = '',
  ) {
     const pageNum = parseInt(page.toString()) || 1;
      const limitNum = parseInt(limit.toString()) || 10;
    return await this.anomalyService.getAnomaly(pageNum, limitNum, orderby, status, criticity, section);
  }

  @Get('getAnomalyById/:id')
  @ApiOperation({ summary: 'Get anomaly by ID' })
  @ApiParam({ name: 'id', description: 'Anomaly ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Anomaly retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly not found',
  })
  async getAnomalyById(@Param('id') id: string) {
    return await this.anomalyService.getAnomalyById(id);
  }

  @ApiOperation({ summary: 'Create a new anomaly' })
  @ApiResponse({
    status: 201,
    description: 'Anomaly created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @Post('createAnomaly')
  async createAnomaly(@Body() data: CreateAnomalieDto) {
    return await this.anomalyService.createAnomaly(data);
  }

  // with comment NOT TEsTed
  @ApiOperation({ summary: 'Upload attachment for anomaly' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Anomaly ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (Excel, PDF, Word)',
        },
        description: {
          type: 'string',
          description: 'Optional file description',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or upload failed',
  })
  @Post('attachment/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/attachments',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadAttachment(
    @Param('id') anomalyId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(xlsx|xls|pdf|doc|docx)$/,
          }),
        ],
      }),
    )
    file: any,
    @Body('description') description?: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      // Validate file exists and has required properties
      if (!file.filename || !file.path || !file.originalname) {
        throw new BadRequestException('Invalid file upload');
      }
      // Save attachment to database
      const attachment = await this.anomalyService.uploadAttachment(anomalyId, {
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        description: description || null,
      });

      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @ApiOperation({ summary: 'Create action plan for anomaly' })
  @ApiParam({ name: 'anomalyId', description: 'Anomaly ID', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Action plan created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @Post('action_plan/:anomalyId')
  async actionPlan(
    @Param('anomalyId') anomalyId: string,
    @Body() body: CreateActionPlanDto,
  ) {
    return await this.anomalyService.actionPlan(anomalyId, body);
  }

  @ApiOperation({ summary: 'Create maintenance window from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file containing maintenance window data',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance windows created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Maintenance windows created successfully',
        },
        data: {
          type: 'object',
          properties: {
            file_name: { type: 'string' },
            file_url: { type: 'string' },
            processed_rows: { type: 'number' },
            created_windows: { type: 'number' },
            windows: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or processing failed',
  })
  @Post('maintenance_window')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/maintenance',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `maintenance-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async maintenanceWindow(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No Excel file uploaded');
      }

      // Validate file
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only Excel files are allowed',
        );
      }

      const sheetName = file.originalname;

      // Process with Python script (WAIT for completion)
      const result = await this.pythonExecutorService.analyzeExcelRows(
        file.path,
        sheetName,
      );
      if (!result.success) {
        throw new BadRequestException(
          `Python processing failed: ${result.error}`,
        );
      }

      // Process the results - simpler version
      const createdWindows = [];

      // Ensure we have an array to work with
      const dataToProcess = Array.isArray(result.data)
        ? result.data
        : [result.data];

      for (const rowData of dataToProcess) {
        try {
          if (rowData) {
            const window = await this.anomalyService.createMaintenanceWindow(
              rowData["Date début d'Arrét (Window)"],
              rowData["Date fin d'Arrét (Window)"],
              rowData['Durée en Jr'] || null,
              rowData['Durée en H'] || null,
            );
            createdWindows.push(window);
          } else {
            console.warn('Skipping row: Missing required fields', rowData);
          }
        } catch (error) {
          console.error('Failed to create maintenance window:', error);
        }
      }

      return {
        success: true,
        message: 'Maintenance windows created successfully',
        data: {
          file_name: sheetName,
          file_url: 'we will develop this later',
          processed_rows: result.data.length,
          created_windows: createdWindows.length,
          windows: createdWindows,
        },
      };
    } catch (error) {
      console.error('Controller error:', error);
      throw new BadRequestException(`Processing failed: ${error.message}`);
    }
  }

  // khass maintenace window ib9a ajour la ssala arrete o matclosatch dik anomaly khassha t assigna  l blassa okhra
  //finma izide chi maintenacne window jdida i3awad idire dik twichia

  @ApiOperation({ summary: 'Mark anomaly as resolved' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Anomaly ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Resolution file (optional)',
        },
        summary: {
          type: 'string',
          description: 'Resolution summary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Anomaly marked as resolved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @Post('mark_as_resolved/:id')
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
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async markAsResolved(
    @Param('id') id: string,
    file: any,
    @Body('summary') summary?: string,
  ) {
    return await this.anomalyService.markAsResolved(id, file, summary);
  }

  @ApiOperation({ summary: 'Update anomaly' })
  @ApiParam({ name: 'id', description: 'Anomaly ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Anomaly updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly not found',
  })
  @Patch('updateAnomaly/:id')
  async updateAnomaly(
    @Param('id') id: string,
    @Body() body: UpdateAnomalieDto,
  ) {
    console.log('Updating anomaly with ID:', id, 'and body:', body);
    return await this.anomalyService.updateAnomaly(id, body);
  }

  @ApiOperation({ summary: 'Attach maintenance window to anomaly' })
  @ApiParam({ name: 'anomalyid', description: 'Anomaly ID', type: 'string' })
  @ApiParam({
    name: 'maintenanceid',
    description: 'Maintenance Window ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance window attached successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly or maintenance window not found',
  })
  @Patch('attach_mw/:anomalyid/:maintenanceid')
  async attachMaintenanceWindow(
    @Param('anomalyid') anomalyId: string,
    @Param('maintenanceid') maintenanceId: string,
  ) {
    return await this.anomalyService.attachMaintenanceWindow(
      anomalyId,
      maintenanceId,
    );
  }

  @ApiOperation({ summary: 'Mark anomaly as treated' })
  @ApiParam({ name: 'id', description: 'Anomaly ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Anomaly marked as treated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly not found',
  })
  @Patch('traited/:id')
  async markAsTreated(@Param('id') id: string) {
    return await this.anomalyService.markAsTreated(id);
  }

  @ApiOperation({ summary: 'Add maintenance window' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance window added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  
  @Post('adding_maintenance_window')
  async addingMaintenanceWindow(@Body() data: ForceStopDto) {
    return await this.anomalyService.addingMaintenanceWindow(data);
  }


}

