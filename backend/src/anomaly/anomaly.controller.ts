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
import { AnomalyService } from './anomaly.service';
import { CreateAnomalieDto, UpdateAnomalieDto } from './dto/anomalie.dto';
import { PythonExecutorService } from './python.service';
import { ForceStopDto } from './dto/forceStop.dto';
import {
  ActionPlanResponseDto,
  CreateActionPlanDto,
} from './dto/actionPlan.dto';
import { Public } from 'src/metadata';

@Controller('anomaly')
@Public()
export class AnomalyController {
  constructor(
    private readonly anomalyService: AnomalyService,
    private readonly pythonExecutorService: PythonExecutorService,
  ) {}

  @Get('getAnomaly')
  async getAnomaly(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') orderby: string = '',
  ) {
    return await this.anomalyService.getAnomaly(page, limit, orderby);
  }

  @Get('getAnomalyById/:id')
  async getAnomalyById(@Param('id') id: string) {
    return await this.anomalyService.getAnomalyById(id);
  }

  @Post('createAnomaly')
  async createAnomaly(@Body() data: CreateAnomalieDto) {
    return await this.anomalyService.createAnomaly(data);
  }

  // with comment
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

  @Post('action_plan/:anomalyId')
  async actionPlan(
    @Param('anomalyId') anomalyId: string,
    @Body() body: CreateActionPlanDto,
  ) {
    return await this.anomalyService.actionPlan(anomalyId, body);
  }

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
        throw new BadRequestException('Invalid file type. Only Excel files are allowed');
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
      const dataToProcess = Array.isArray(result.data) ? result.data : [result.data];
      
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

  @Patch('updateAnomaly/:id')
  async updateAnomaly(
    @Param('id') id: string,
    @Body() body: UpdateAnomalieDto,
  ) {
    return await this.anomalyService.updateAnomaly(id, body);
  }

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

  @Patch('traited/:id')
  async markAsTreated(@Param('id') id: string) {
    return await this.anomalyService.markAsTreated(id);
  }

  @Patch('adding_maintenance_window')
  async addingMaintenanceWindow(@Body() data: ForceStopDto) {
    return await this.anomalyService.addingMaintenanceWindow(data);
  }
}
