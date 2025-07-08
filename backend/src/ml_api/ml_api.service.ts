import { Injectable } from '@nestjs/common';
import { PrioritySuggestionDto } from './dto/prioritysuggestion.dto';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class MlApiService {
  async sendPriorityRequest(data: PrioritySuggestionDto) {
    try {
      const response = await axios.post('http://fastapi:4000', data, {
        headers: {
          'Content-Type': 'multipart/form-data/json',
        },
        timeout: 10000, // 10 seconds timeout
      });

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
        'http://fastapi:4000/upload-file',
        formData,
        {
          headers: {
            ...formData.getHeaders(), // Important: gets the correct Content-Type with boundary
          },
          timeout: 30000, // 30 seconds for file upload
        },
      );

      return response.data;
    } catch (error) {
      console.error('ML API file upload failed:', error.message);
      throw new Error(`ML API file upload failed: ${error.message}`);
    }
  }
}
