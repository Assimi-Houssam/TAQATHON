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
  Delete,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';

// Allowed MIME types for REX documents
const ALLOWED_REX_MIME_TYPES = [
  'application/pdf',
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg', 
  'image/png'
];

// Allowed MIME types for attachments
const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];
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
  UpdateActionPlanDto,
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
    try {
      const pageNum = parseInt(page.toString()) || 1;
       const limitNum = parseInt(limit.toString()) || 10;
     return await this.anomalyService.getAnomaly(pageNum, limitNum, orderby, status, criticity, section);
    }catch (error) {
      console.error('Error retrieving anomalies:', error);
      throw new BadRequestException('Failed to retrieve anomalies');
    }
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
    try {
      return await this.anomalyService.getAnomalyById(id);
    }catch(error) {
      console.error('Error retrieving anomaly by ID:', error);
      throw new BadRequestException('Failed to retrieve anomaly');
    }
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
    try{
      return await this.anomalyService.createAnomaly(data);
    }catch(error) {
      console.error('Error creating anomaly:', error);
      throw new BadRequestException('Failed to create anomaly');
    }
  }

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
        fileSize: 64 * 1024 * 1024, // 64MB limit
      },
    }),
  )
  async uploadAttachment(
    @Param('id') anomalyId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
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
      
      // Custom file type validation for attachments
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_ATTACHMENT_MIME_TYPES.join(', ')}`
        );
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
    try {
    return await this.anomalyService.actionPlan(anomalyId, body);
    }
    catch{
      throw new BadRequestException('Failed to create action plan');
    }
    
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
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async maintenanceWindow(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No Excel file uploaded');
      }
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
      const result = await this.pythonExecutorService.analyzeExcelRows( // spawning python script to read 
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
      await this.anomalyService.autoAssigmentAnomalyToMaintenanceWindowForceStop();
      
      return {
        success: true,
        message: 'Maintenance windows created successfully',
        data: {
          file_name: sheetName,
          file_url: 'we will develop this later',
          processed_rows: dataToProcess.length,
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
  @Post('mark_as_resolved/:id')
  async markAsResolved(
    @Param('id') id: string,
  ) {
    return await this.anomalyService.markAsResolved(id);
  }



  @ApiOperation({ summary: 'Attach REX entry to anomaly' })
  @ApiParam({ name: 'id', description: 'Anomaly ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'REX document file',
        },
        summary: {
          type: 'string',
          description: 'REX summary or description',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'REX entry attached successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or file upload failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly not found',
  })
  @Post('rex/:id')
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
  async attachRexEntry(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 64 * 1024 * 1024 }), // 64MB
        ],
        fileIsRequired: false, // Make file optional
      }),
    )
    file: any,
    @Body('summary') summary?: string,
  ) {
    try {
      // Validate that either file or summary is provided
      if (!file && (!summary || !summary.trim())) {
        throw new BadRequestException('Either file or summary must be provided');
      }

      // Custom file type validation if file is provided
      if (file && !ALLOWED_REX_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_REX_MIME_TYPES.join(', ')}`
        );
      }

      return await this.anomalyService.attachRexEntry(id, file, summary);
    } catch (error) {
      console.error('Error attaching REX entry:', error);
      throw new BadRequestException(`Failed to attach REX entry: ${error.message}`);
    }
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
    try {
      return await this.anomalyService.updateAnomaly(id, body);
    } catch (error) {
      console.error('Error updating anomaly:', error);
      throw new BadRequestException(`Failed to update anomaly: ${error.message}`);
    }
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


  @ApiOperation({ summary: 'delete maintenance window' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance window deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @Delete('deletemaintenance/:id')
  async deleteMaintenanceWindow(@Param('id') id: string) {
    return await this.anomalyService.deleteMaintenanceWindow(id);
  }


  @ApiOperation({ summary: 'Get all action plans for an anomaly' })
  @ApiParam({ name: 'anomalyId', description: 'Anomaly ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Action plans retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              id: { type: 'string' },
              Action: { type: 'string' },
              responsable: { type: 'string' },
              pdrs_disponible: { type: 'boolean' },
              resource_intern: { type: 'string' },
              resource_extern: { type: 'string' },
              status: { type: 'string', enum: ['NOT_COMPLETED', 'COMPLETED'] },
              anomaly_id: { type: 'string' },
            }
          }
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly not found',
  })
  @Get('action_plans/:anomalyId')
  async getActionPlans(@Param('anomalyId') anomalyId: string) {
    try {
      return await this.anomalyService.getActionPlans(anomalyId);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve action plans');
    }
  }

  @ApiOperation({ summary: 'Update action plan for anomaly' })
  @ApiParam({ name: 'id', description: 'Anomaly ID', type:
    'string' })
  @ApiResponse({
    status: 200,
    description: 'Action plan updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Anomaly not found',
  })
  @Patch('updateActionPlan/:id')
  async updateActionPlan( @Param('id') id: string) {
    try {
      return await this.anomalyService.updateActionPlan(id);
    } catch (error) {
      console.error('Error updating action plan:', error);
      throw new BadRequestException('Failed to update action plan');
    }
  }

  @ApiOperation({ summary: 'Delete action plan for anomaly' })
  @ApiParam({ name: 'id', description: 'Action Plan ID', type:
    'string' })
  @ApiResponse({
    status: 200,
    description: 'Action plan deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Action plan not found',
  })
  @Delete('deleteActionPlan/:id')
  async deleteActionPlan(@Param('id') id: string) {
    try {
      return await this.anomalyService.deleteActionPlan(id);
    } catch (error) {
      console.error('Error deleting action plan:', error);
      throw new BadRequestException('Failed to delete action plan');
    }
  }




  @Get('download-attachment/:id')
  @ApiOperation({ summary: 'Download attachment file' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attachment not found',
  })
  async downloadAttachment(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const fileInfo = await this.anomalyService.downloadattachment(id);
      
      // Set headers for file download
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(fileInfo.filePath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        throw new HttpException('Error reading file', HttpStatus.INTERNAL_SERVER_ERROR);
      });
      
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Download error:', error);
      throw new HttpException(
        error.message || 'Failed to download file',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('download-rex/:id')
  @ApiOperation({ summary: 'Download rex file' })
  @ApiParam({ name: 'id', description: 'rex ID' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'rex not found',
  })
  async downloadRex(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const fileInfo = await this.anomalyService.downloadrex(id);
      // Set headers for file download
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(fileInfo.filePath);
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        throw new HttpException('Error reading file', HttpStatus.INTERNAL_SERVER_ERROR);
      });
      fileStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      throw new HttpException(
        error.message || 'Failed to download file',
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  @Get('getmaintenancewondow')
  @ApiOperation({ summary: 'Get all maintenance windows' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance windows retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              start_date: { type: 'string', format: 'date-time' },
              end_date: { type: 'string', format: 'date-time' },
              duration_days: { type: 'number' },
              duration_hours: { type: 'number' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve maintenance windows',
  })
  async getMaintenanceWindow()
  {
    try {
      return await this.anomalyService.getMaintenanceWindows();
    } catch (error) {
      console.error('Error retrieving maintenance windows:', error);
      throw new BadRequestException('Failed to retrieve maintenance windows');
    }
  }


  @ApiOperation({ summary: 'Check action status for action plan' })
  @ApiParam({ name: 'id', description: 'Action Plan ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Action status checked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Action plan not found',
  })
  @Patch('checkaction/:id')
  async checkaction(@Param('id') id: string) {
    try {
      return await this.anomalyService.checkaction(id);
    } catch (error) {
      console.error('Error checking action:', error);
      throw new BadRequestException('Failed to check action');
    }
  }

  @ApiOperation({ summary: 'Delete action' })
  @ApiParam({ name: 'id', description: 'Action ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Action deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Action not found',
  })
  @Delete('deleteaction/:id')
  async deleteAction(@Param('id') id: string) {
    try {
      return await this.anomalyService.deleteAction(id);
    } catch (error) {
      console.error('Error deleting action:', error);
      throw new BadRequestException('Failed to delete action');
    }
  }


  @ApiOperation({ summary: 'Delete attachment' })
  @ApiParam({ name: 'id', description: 'Attachment ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Attachment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attachment not found',
  })
  @Delete('deleteattachment/:id')
  async deleteAttachment(@Param('id') id: string) {
    try {
      return await this.anomalyService.deleteAttachment(id);
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw new BadRequestException('Failed to delete attachment');
    }
  }


  @Delete('deleteanomaly/:id')
  async deleteAnomaly(@Param('id') id: string) {
    try {
      return await this.anomalyService.deleteAnomaly(id);
    } catch (error) {
      console.error('Error deleting anomaly:', error);
      throw new BadRequestException('Failed to delete anomaly');
    }
  }

}

