import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogFilterDto } from './dto/log.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Logs')
@Controller('logs')
@UseGuards(AuthGuard, RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs with filters and pagination' })
  @ApiResponse({ status: 400, description: 'Invalid filter parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() filterDto: LogFilterDto,
    @GetUser() user: User,
  ) {
    return this.logsService.findLogs(filterDto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log details by ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Log not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.logsService.findLogById(id, user);
  }
}
