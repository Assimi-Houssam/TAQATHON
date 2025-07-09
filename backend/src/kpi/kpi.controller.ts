import { BadRequestException, Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KpiService } from './kpi.service';
import { Public } from 'src/metadata';

@ApiTags('KPI')
@Controller('kpi')
@Public()
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('actionplan')
  @ApiOperation({ summary: 'Get action plan statistics' })
  @ApiResponse({
    status: 200,
    description: 'Action plan statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            completed: { type: 'number', example: 75 },
            inProgress: { type: 'number', example: 50 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async actionplan() {
    try {
      return this.kpiService.actionplan();
    } catch (err) {
      console.error('Error in actionplan:', err);
      throw new Error('Failed to retrieve action plan data');
    }
  }

  @Get('average-processing-time')
  @ApiOperation({
    summary: 'Get average processing time between detection and treatment',
  })
  @ApiResponse({
    status: 200,
    description: 'Average processing time retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        averageHours: { type: 'number', example: 72.5 },
        averageDays: { type: 'number', example: 3.02 },
        totalAnomalies: { type: 'number', example: 150 },
        minHours: { type: 'number', example: 2.5 },
        maxHours: { type: 'number', example: 168.0 },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hours: { type: 'number' },
              days: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAverageProcessingTime() {
    try {
      return this.kpiService.getAverageProcessingTime();
    } catch (err) {
      console.error('Error in getAverageProcessingTime:', err);
      throw new Error('Failed to retrieve average processing time');
    }
  }

  @Get('getanomaliesinprogress')
  @ApiOperation({ summary: 'Get anomalies in progress statistics' })
  @ApiResponse({
    status: 200,
    description: 'Anomalies in progress statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAnomalies: { type: 'number', example: 200 },
        totalanomaliesinprogress: { type: 'number', example: 75 },
        percentageWithDates: { type: 'number', example: 37.5 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnomaliesInProgress() {
    try {
      return this.kpiService.getAnomaliesInProgress();
    } catch (err) {
      console.error('Error in getAnomaliesInProgress:', err);
      throw new Error('Failed to retrieve kpi for anomalies in progress');
    }
  }

  @Get('anomaliesclosed')
  @ApiOperation({ summary: 'Get closed anomalies statistics' })
  @ApiResponse({
    status: 200,
    description: 'Closed anomalies statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAnomalies: { type: 'number', example: 200 },
        totalanomaliesclosed: { type: 'number', example: 125 },
        percentageWithDates: { type: 'number', example: 62.5 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnomaliesClosed() {
    try {
      return this.kpiService.getAnomaliesClosed();
    } catch (err) {
      console.error('Error in getAnomaliesClosed:', err);
      throw new Error('Failed to retrieve kpi for closed anomalies');
    }
  }

  @Get('anomaliesByCriticality')
  @ApiOperation({ summary: 'Get anomalies grouped by criticality level' })
  @ApiResponse({
    status: 200,
    description: 'Anomalies by criticality retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalanomalihigh: { type: 'number', example: 45 },
        totalanomalimedium: { type: 'number', example: 85 },
        totalanomalilow: { type: 'number', example: 70 },
        percentageHigh: { type: 'number', example: 22.5 },
        percentageMedium: { type: 'number', example: 42.5 },
        percentageLow: { type: 'number', example: 35.0 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnomaliesByCriticality() {
    try {
      return this.kpiService.getAnomaliesByCriticality();
    } catch (err) {
      console.error('Error in getAnomaliesByCriticality:', err);
      throw new Error('Failed to retrieve kpi for anomalies by criticality');
    }
  }

  @Get('anomaliesByStoppingRequirement')
  @ApiOperation({ summary: 'Get anomalies by stopping requirement' })
  @ApiResponse({
    status: 200,
    description: 'Anomalies by stopping requirement retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 200 },
        requiringStop: { type: 'number', example: 45 },
        notRequiringStop: { type: 'number', example: 155 },
        percentageRequiringStop: { type: 'number', example: 22.5 },
        percentageNotRequiringStop: { type: 'number', example: 77.5 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnomaliesByStoppingRequirement() {
    try {
      return this.kpiService.getanomaliesByStoppingRequirement();
    } catch (err) {
      console.error('Error in getAnomaliesByStoppingRequirement:', err);
      throw new Error(
        'Failed to retrieve kpi for anomalies by stopping requirement',
      );
    }
  }



  @Get('anomalieschart')
  @ApiOperation({ summary: 'Get anomalies chart data' })
  @ApiResponse({
    status: 200,
    description: 'Anomalies chart data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        // Add specific properties based on your chart data structure
        chartData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', example: 'January' },
              value: { type: 'number', example: 25 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnomaliesChart() {
    try {
      return this.kpiService.getAnomaliesChart();
    } catch (err) {
      console.error('Error in getAnomaliesChart:', err);
      throw new BadRequestException('Failed to retrieve anomalies chart data');
    }
  }

}
