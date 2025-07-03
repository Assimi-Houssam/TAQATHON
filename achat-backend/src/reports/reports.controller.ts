import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { GetRepliesDto } from './dto/get-replies.dto';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportStatus } from './enums/report-status.enum';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  // @Roles(
  //   KeycloakRole.CREATE_REPORT,
  //   KeycloakRole.MANAGE_ALL_REPORTS,
  // )
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @GetUser() user: User,
  ) {
    const report = await this.reportsService.create(createReportDto, user);
    return {
      message: 'Report created successfully',
      reportId: report.id,
    };
  }

  @Get()
  // @Roles(
  //   KeycloakRole.MANAGE_ALL_REPORTS,
  //   KeycloakRole.READ_ALL_REPORTS,
  //   KeycloakRole.READ_OWN_REPORTS,
  // )
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'Return all reports' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getReports(
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reportsService.findAll({
      user,
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  // @Roles(
  //   KeycloakRole.MANAGE_ALL_REPORTS,
  //   KeycloakRole.READ_ALL_REPORTS,
  //   KeycloakRole.READ_OWN_REPORTS,
  // )
  @ApiOperation({ summary: 'Get report by id' })
  @ApiResponse({ status: 200, description: 'Return report details' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getReport(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.reportsService.findOne(id, user);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get all replies to report' })
  @ApiResponse({
    status: 200,
    description: 'Return all replies to report with pagination',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getReportReplies(
    @Param('id', ParseIntPipe) id: number,
    @Query() getRepliesDto: GetRepliesDto,
  ) {
    return this.reportsService.getReplies(id, getRepliesDto);
  }

  @Post(':id/replies')
  // @Roles(KeycloakRole.CREATE_REPORT_REPLY)
  @ApiOperation({ summary: 'Add reply to report' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() createReplyDto: CreateReplyDto,
    @GetUser() user: User,
  ) {
    const reply = await this.reportsService.addReply(id, createReplyDto, user);
    return {
      message: 'Reply added successfully',
      replyId: reply.id,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report status' })
  @ApiResponse({
    status: 200,
    description: 'Report status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateReportStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ReportStatus,
    @GetUser() user: User,
  ) {
    await this.reportsService.updateReportStatus(id, status, user);
    return {
      message: `Report status updated to ${status} successfully`,
    };
  }
}
