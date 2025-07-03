import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Param,
  Query,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { GetFeedbacksDto } from './dto/get-feedbacks.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(AuthGuard, RolesGuard)
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @Roles(AppRole.CREATE_FEEDBACK)
  @ApiOperation({ summary: 'Create a new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found or not associated with company' })
  @ApiResponse({ status: 403, description: 'Supplier has not worked on this purchase request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @GetUser() user: User,
  ) {
    return this.feedbacksService.createFeedback(createFeedbackDto, user);
  }

  @Get('supplier/:id')
  @Roles(AppRole.READ_ALL_FEEDBACKS)
  @ApiOperation({ summary: 'Get supplier feedbacks' })
  @ApiResponse({ status: 200, description: 'Return supplier feedbacks' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFeedbacksBySupplier(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetFeedbacksDto,
  ): Promise<{
    data: {
      id: number;
      description: string;
      rating: number;
      agent: {
        id: number;
        first_name: string;
        last_name: string;
        avatar: string;
      };
    }[];
    page: number;
    limit: number;
    total: number;
  }> {
    return this.feedbacksService.getFeedbacksBySupplier(id, query);
  }

  @Put(':id')
  @Roles(AppRole.MODIFY_OWN_FEEDBACK)
  @ApiOperation({ summary: 'Update feedback' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiResponse({ status: 403, description: 'Can only update own feedback' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @GetUser() user: User,
  ) {
    return this.feedbacksService.updateFeedback(id, updateFeedbackDto, user);
  }

  @Delete(':id')
  @Roles(AppRole.MODIFY_OWN_FEEDBACK)
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiResponse({ status: 403, description: 'Can only delete own feedback' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteFeedback(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.feedbacksService.deleteFeedback(id, user);
  }
}
