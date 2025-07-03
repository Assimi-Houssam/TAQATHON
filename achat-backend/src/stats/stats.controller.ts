import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { StatsService } from './stats.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

@Controller('stats')
@UseGuards(AuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('/totals')
  @ApiOperation({ summary: 'Get total stats' })
  @ApiResponse({ status: 200, description: 'Return total stats' })
  @ApiResponse({ status: 404, description: 'Stats not found' })
  async getStats() {
    return this.statsService.getStats();
  }

  @Get('/departments')
  @ApiOperation({ summary: 'Get departments PRs per year' })
  @ApiResponse({ status: 200, description: 'Return departments PRs per year' })
  @ApiResponse({ status: 404, description: 'Departments stats not found' })
  async getDepartments(@Query('year') year: number) {
    return this.statsService.getDepartmentsStat(year);
  }

  // add pagination to get top companies
  @Get('/companies')
  @ApiOperation({ summary: 'Get companies PRs per year' })
  @ApiResponse({ status: 200, description: 'Return companies PRs per year' })
  @ApiResponse({ status: 404, description: 'Companies stats not found' })
  async getCompanies(
    @Query('year') year: number,  
    @Query('business_scope') business_scope: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.statsService.getCompaniesStat(year, business_scope, page, limit);
  }
}
