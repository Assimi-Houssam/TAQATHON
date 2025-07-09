import { Injectable } from '@nestjs/common';
import { PrioritySuggestionDto } from './dto/prioritysuggestion.dto';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { CAnomalieDto } from './dto/anomaly.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MlApiService {
  constructor(private readonly Prisma: PrismaService) {}

  async sendPriorityRequest(data: PrioritySuggestionDto) {
    try {
      const response = await axios.post(
        `${process.env.ML_API_BASE_URL}:${process.env.ML_API_PORT}/predict`,
        data, // pass the object directly
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
      );

      return response.data;
    } catch (error) {
      console.error('ML API request failed:', error.message);
      throw new Error(`ML API request failed: ${error.message}`);
    }
  }

  async sendAnomalyFile(file: any) {
    try {
      // Create FormData instance
      const formData = new FormData();

      // Read file as stream
      const fileStream = fs.createReadStream(file.path);

      // Append file to FormData
      formData.append('file', fileStream, {
        filename: file.originalname || 'anomaly_file.xlsx',
        contentType:
          file.mimetype ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      // Add additional metadata if needed
      formData.append('file_type', 'excel');

      const response = await axios.post(
        `${process.env.ML_API_BASE_URL}:${process.env.ML_API_PORT}/predict_excel`,
        formData,
        {
          headers: {
            ...formData.getHeaders(), // Important: gets the correct Content-Type with boundary
          },
          timeout: 30000, // 30 seconds for file upload
        },
      );
      // Clean up the temporary file
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return response.data;
    } catch (error) {
      console.error('ML API file upload failed:', error.message);
      throw new Error(`ML API file upload failed: ${error.message}`);
    }
  }

  async processFastApiResponse(data: CAnomalieDto) {
    try {
      // Save the anomaly data to the database
      const sorting = parseInt(data.criticite) || 0;
      const anomaly = await this.Prisma.anomaly.create({
        data: {
          ...data,
          date_detection: new Date(data.date_detection),
          sorting: sorting,
        },
      });
      return { message: 'Anomaly processed successfully', anomaly };
    } catch (error) {
      console.error('Error processing FastAPI response:', error.message);
      throw new Error(`Error processing FastAPI response: ${error.message}`);
    }
  }
}
