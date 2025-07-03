import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResult } from './types/search-type';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Search across multiple entities', 
    description: 'Search for users, companies, purchase requests, and bids'
  })
  @ApiQuery({ name: 'query', required: true, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Return search results with pagination' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async search(
    @Query() searchQueryDto: SearchQueryDto,
    @GetUser() currentUser: User,
  ): Promise<{ results: SearchResult[]; total: number }> {
    const { query, page, limit } = searchQueryDto;
    return this.searchService.search(
      {
        query,
        page,
        limit,
      },
      currentUser.id,
    );
  }
}
