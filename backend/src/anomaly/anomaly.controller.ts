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
import { PythonExecutorService } from './python,service';

@Controller('anomaly')
export class AnomalyController {
  constructor(private readonly anomalyService: AnomalyService,
              private readonly pythonExecutorService: PythonExecutorService
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

  @Post('action_plan')
  async actionPlan(@Body() body: any) {
    // return await this.anomalyService.actionPlan(body);
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
  async maintenanceWindow(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(xlsx|xls)$/ }),
        ],
      }),
    )
    file: any,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No Excel file uploaded');
      }
      // Validate name of  the file name
      const sheetName = file.originalname;
      
      const file_maintenance =  await this.anomalyService.uploadMaintenanceWindow(file.path, sheetName);

      // Process Excel file with Python script
      const result = await this.pythonExecutorService.analyzeExcelRows(
        file.path,
        sheetName,
      );

      if (!result.success) {
        throw new BadRequestException(
          `Python processing failed: ${result.error}`,
        );
      }
      for (const rowData of result.data) {
        try {
            await this.anomalyService.createMaintenanceWindow(
              rowData["Date début d'Arrêt (Window)"],
              rowData["Date fin d'Arrêt (Window)"],
              rowData['Durée en Jr'],
              rowData['Durée en H'],
            );

        } catch (error) {
          console.error(
            `Failed to create maintenance window for row ${rowData.row_index}:`,
            error,
          );
        }
      }
      const mainData = await this.anomalyService.getMaintenanceWindows();

      return {
        success: true,
        message: 'Maintenance windows created successfully',
        data: {
          file_name: sheetName,
          file_url :  'we will develop this later',// we will have a download button i guess or we will show it directly on our frontend
          // data  : mainData
        },
      };
    } catch (error) {
      throw new BadRequestException(`Processing failed: ${error.message}`);
    }
  }

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
  async markAsResolved(@Param('id') id: string, file: any , @Body('summary') summary?: string) {
    return await this.anomalyService.markAsResolved(id, file, summary);
  }

  @Patch('updateAnomaly/:id')
  async updateAnomaly(@Param('id') id: string, @Body() body: UpdateAnomalieDto) {
    return await this.anomalyService.updateAnomaly(id, body);
  }
  
    @Patch('attach_mw/:anomalyid/:maintenanceid')
    async attachMaintenanceWindow(
      @Param('anomalyid') anomalyId: string,
      @Param('maintenanceid') maintenanceId: string,
    ) {
      return await this.anomalyService.attachMaintenanceWindow(anomalyId, maintenanceId);
    }

    @Patch('resolveAnomaly/:id')
    async resolveAnomaly(@Param('id') id: string) {
      return await this.anomalyService.resolveAnomaly(id);
    }

    //  arrete force 
    @Patch('forceStop')
    async forceStopAnomaly() {
      // return await this.anomalyService.forceStopAnomaly();
    }

  }
