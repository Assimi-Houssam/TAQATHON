import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateFormFieldDto } from './dto/formfield.dto';
import { CreateFormDto } from './dto/forms.dto';
import { LayoutDto } from './dto/layout.dto';
import { FormsService } from './forms.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Forms')
@Controller('forms')
@UseGuards(AuthGuard, RolesGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  @Roles(AppRole.MANAGE_QUESTIONS)
  @ApiOperation({ summary: 'Get all forms' })
  @ApiResponse({ status: 200, description: 'Return all forms' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllForms() {
    return await this.formsService.getAllForms();
  }

  @Post()
  @Roles(AppRole.CREATE_QUESTIONS)
  @ApiOperation({ summary: 'Create a new form' })
  @ApiResponse({ status: 201, description: 'Form created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createForm(@Body() data: CreateFormDto) {
    await this.formsService.createForm(data);
  }

  @Get(':formName')
  @Roles(AppRole.MANAGE_QUESTIONS)
  @ApiOperation({ summary: 'Get form fields by form name' })
  @ApiQuery({
    name: 'locale',
    required: false,
    description: 'Locale for form field translations',
  })
  @ApiResponse({ status: 200, description: 'Return form fields' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFormFields(
    @Param('formName') formName: string,
    @Query('locale') locale?: string,
  ) {
    return this.formsService.getAllFormFields(formName, locale);
  }

  @Post(':formName/layout')
  @Roles(AppRole.MANAGE_QUESTIONS)
  @ApiOperation({ summary: 'Save form layout' })
  @ApiResponse({ status: 201, description: 'Layout saved successfully' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 400, description: 'Invalid layout data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async saveLayout(
    @Param('formName') formName: string,
    @Body() layout: LayoutDto['layout'],
  ) {
    await this.formsService.saveLayout(formName, layout);
  }

  @Post('field')
  @Roles(AppRole.CREATE_QUESTIONS)
  @ApiOperation({ summary: 'Create a new form field' })
  @ApiResponse({ status: 201, description: 'Form field created successfully' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 400, description: 'Invalid field type constraints' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createFormField(@Body() data: CreateFormFieldDto) {
    await this.formsService.createFormField(data);
  }

  @Delete(':formFieldId')
  @Roles(AppRole.DELETE_QUESTIONS)
  @ApiOperation({ summary: 'Delete form field' })
  @ApiResponse({ status: 200, description: 'Form field deleted successfully' })
  @ApiResponse({ status: 404, description: 'Form field not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteFormField(@Param('formFieldId', ParseIntPipe) formFieldId: number) {
    await this.formsService.deleteFormField(formFieldId);
  }
}
