import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
  ParseIntPipe,
} from '@nestjs/common';
import { DepartementsService } from './departements.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDepartementDto, UpdateDepartementDto } from './dto/Departements.dto';

@ApiTags('Departments')
@Controller('departements')
export class DepartementsController {
  constructor(private readonly departementsService: DepartementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Return all active departments' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    try {
      return await this.departementsService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch departements',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  @ApiResponse({ status: 200, description: 'Return department details' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const departement = await this.departementsService.findOne(id);
      if (!departement) {
        throw new HttpException('Departement not found', HttpStatus.NOT_FOUND);
      }
      return departement;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch departement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createDepartementDto: CreateDepartementDto) {
    try {
      return await this.departementsService.create(createDepartementDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create departement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartementDto: UpdateDepartementDto,
  ) {
    try {
      const departement = await this.departementsService.update(
        id,
        updateDepartementDto,
      );
      if (!departement) {
        throw new HttpException('Departement not found', HttpStatus.NOT_FOUND);
      }
      return departement;
    } catch (error) {
      throw new HttpException(
        'Failed to update departement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.departementsService.remove(id);
      return { message: 'Department deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete department',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
