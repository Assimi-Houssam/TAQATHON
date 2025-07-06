import { Injectable, BadRequestException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PythonExecutorService {
  private readonly pythonScriptPath = path.join(
    process.cwd(), 
    'src', 
    'anomaly', 
    'pythonScript', 
    'maintenanceWindow.py'
  );

  async analyzeExcelRows(filePath: string, sheetName?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = ['--file_path', filePath];
      if (sheetName) {
        args.push('--sheet_name', sheetName);
      }

      console.log(`Executing Python script: python3 ${this.pythonScriptPath} ${args.join(' ')}`);

      const pythonProcess = spawn('python3', [this.pythonScriptPath, ...args]);
      
      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up the uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (code === 0) {
          try {
            const result = JSON.parse(output);
            if (result.success) {
              resolve(result);
            } else {
              reject(new BadRequestException(`Python processing failed: ${result.error}`));
            }
          } catch (parseError) {
            console.error('Failed to parse Python output:', output);
            reject(new BadRequestException(`Failed to parse Python output: ${parseError.message}`));
          }
        } else {
          console.error('Python script error:', errorOutput);
          reject(new BadRequestException(`Python script failed with code ${code}: ${errorOutput}`));
        }
      });

      pythonProcess.on('error', (error) => {
        // Clean up on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(new BadRequestException(`Failed to execute Python script: ${error.message}`));
      });
    });
  }
}