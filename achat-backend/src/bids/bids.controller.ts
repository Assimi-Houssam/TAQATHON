import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { GetUser } from 'decorators/get-user.decorator';
import { CreateBidDto, ShowInterestDto } from './dto/create-bid.dto';
import { BidsService } from './bids.service';
import { User } from 'src/users/entities/user.entity';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BidStats } from './interfaces/bid-stats.interface';

@ApiTags('Bids')
@ApiBearerAuth()
@Controller('ocp/bids')
@UseGuards(AuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get()
  @ApiOperation({ summary: 'Get bid statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Returns bid statistics' })
  async getDashboardStats(): Promise<BidStats> {
    return this.bidsService.getDashboardStats();
  }

  @Post()
  // @Roles(KeycloakRole.CREATE_BIDS)
  @ApiOperation({ summary: 'Create a new bid' })
  @ApiResponse({ status: 201, description: 'Bid created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async create(@Body() createBidDto: CreateBidDto, @GetUser() user: User) {
    return this.bidsService.createBid(createBidDto, user);
  }

  @Post('interest')
  // @Roles(KeycloakRole.CREATE_BIDS)
  @ApiOperation({ summary: 'Show interest in a purchase request' })
  @ApiResponse({ status: 201, description: 'Interest registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async interest(
    @Body() showInterestDto: ShowInterestDto,
    @GetUser() user: User,
  ) {
    return this.bidsService.showInterestBid(showInterestDto, user);
  }

  @Get('purchase-request/:id/latest')
  // @Roles(KeycloakRole.READ_OWN_BIDS, KeycloakRole.READ_OTHER_BIDS)
  @ApiOperation({ summary: 'Get latest bids for a purchase request' })
  @ApiParam({
    name: 'id',
    description: 'Purchase Request ID',
    type: 'number',
    required: true,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Return latest bids' })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getLatestBid(@Param('id', ParseIntPipe) purchaseRequestId: number) {
    return this.bidsService.getLatestBid(purchaseRequestId);
  }
}
