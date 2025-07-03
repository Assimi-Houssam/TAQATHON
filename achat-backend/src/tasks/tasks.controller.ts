import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/task.dto';
import { Task } from './entities/task.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetTasksDto } from './dto/task.dto';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Create a new task for a user',
  })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid task data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    const task = await this.tasksService.create(createTaskDto, user);
    return {
      message: 'Task created successfully',
      taskId: task.id,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all user tasks',
    description: 'Get all user tasks with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated user tasks' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findUserTasks(@Query() getTasksDto: GetTasksDto, @GetUser() user: User) {
    return this.tasksService.findUserTasks(getTasksDto, user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Get a specific task by its ID',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Returns the task' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle task completion status' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async toggleCompletion(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    await this.tasksService.toggleTaskCompletion(id, user.id);
    return {
      message: 'Task status toggled successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Delete a task by its ID',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    await this.tasksService.remove(id, user.id);
    return {
      message: 'Task deleted successfully',
    };
  }
}
