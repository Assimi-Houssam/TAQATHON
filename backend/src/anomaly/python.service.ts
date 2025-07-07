import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class PythonExecutorService {
  private readonly pythonScriptPath = path.join(
    process.cwd(), 
    'src/anomaly/pythonScript/maintenanceWindow.py'
  );

  async analyzeExcelRows(filePath: string, sheetName: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
    metadata?: any;
  }> {
    return new Promise((resolve, reject) => {
      const args = ['--file_path', filePath, '--sheet_name', sheetName];
      
      const pythonProcess = spawn('python3', [this.pythonScriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';

      // Set encoding
      pythonProcess.stdout.setEncoding('utf8');
      pythonProcess.stderr.setEncoding('utf8');

      // Collect stdout
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr (debug info)
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {

        if (code === 0) {
          try {
            // Parse the JSON output from Python
            const result = JSON.parse(stdout.trim());
            
            // Check if the result itself indicates an error
            if (result.success === false) {
              resolve({
                success: false,
                error: result.error,
                metadata: { available_sheets: result.available_sheets }
              });
            } else {
              resolve({
                success: true,
                data: result.data || [],
                metadata: {
                  sheet_used: result.sheet_used,
                  available_sheets: result.available_sheets,
                  columns: result.columns,
                  total_rows: result.total_rows
                }
              });
            }
          } catch (parseError) {
            resolve({
              success: false,
              error: `Failed to parse Python output: ${parseError.message}. Raw output: ${stdout}`,
            });
          }
        } else {
          resolve({
            success: false,
            error: stderr || `Python script exited with code ${code}`,
          });
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Set timeout (30 seconds)
      const timeout = setTimeout(() => {
        pythonProcess.kill('SIGTERM');
        resolve({
          success: false,
          error: 'Python script execution timeout (30 seconds)',
        });
      }, 30000);

      // Clear timeout when process ends
      pythonProcess.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }
}