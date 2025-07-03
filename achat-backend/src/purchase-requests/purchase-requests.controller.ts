import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { GetBidsDto } from './dto/get-bids.dto';
import { InviteToBidDto, InviteToManageDto } from './dto/invite-to-bid.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestStatus } from './enums/purchase-request.enum';
import { PurchaseRequestsService } from './purchase-requests.service';

@ApiTags('Purchase Requests')
@Controller('ocp/purchase-requests')
@UseGuards(AuthGuard, RolesGuard)
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Post()
  // @Roles(KeycloakRole.CREATE_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Create a new purchase request' })
  @ApiResponse({
    status: 201,
    description: 'Purchase request created successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() createPurchaseRequestDto: CreatePurchaseRequestDto,
    @GetUser() user: User,
  ): Promise<PurchaseRequest> {
    return this.purchaseRequestsService.createPurchaseRequest(
      createPurchaseRequestDto,
      user.id,
    );
  }

  @Get()
  // @Roles(KeycloakRole.READ_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Get all purchase requests' })
  @ApiQuery({ name: 'status', required: false, enum: PurchaseRequestStatus })
  @ApiResponse({ status: 200, description: 'Return all purchase requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @GetUser() user: User,
    @Query('status') status?: PurchaseRequestStatus,
  ): Promise<PurchaseRequest[]> {
    return this.purchaseRequestsService.getPurchaseRequests(user.id, status);
  }

  @Get('drafts')
  // @Roles(KeycloakRole.READ_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Get draft purchase requests' })
  @ApiResponse({ status: 200, description: 'Return draft purchase requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDrafts(@GetUser() user: User): Promise<PurchaseRequest[]> {
    return this.purchaseRequestsService.getDraftPurchaseRequests(user?.id);
  }

  @Get(':PR_ref')
  // @Roles(KeycloakRole.READ_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Get purchase request by ID' })
  @ApiParam({ name: 'PR_ref', description: 'Purchase request ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the purchase request',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase request not found or user does not have access',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(
    @Param('PR_ref') PR_ref: string,
    @GetUser() user: User,
  ): Promise<PurchaseRequest> {
    const purchaseRequest =
      await this.purchaseRequestsService.getPurchaseRequestById(
        PR_ref,
        user.id,
      );

    // Transform the entity to DTO
    return purchaseRequest;
  }

  @Post(':purchaseRequestId/invite-to-bid')
  // @Roles(KeycloakRole.MODIFY_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Invite companies to bid on a purchase request' })
  @ApiParam({ name: 'purchaseRequestId', description: 'Purchase request ID' })
  @ApiResponse({ status: 201, description: 'Companies invited successfully' })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 400, description: 'One or more companies not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async inviteCompaniesToBid(
    @Param('purchaseRequestId', ParseIntPipe) purchaseRequestId: number,
    @Body() inviteToBidDto: InviteToBidDto,
    @GetUser() user: User,
  ) {
    return await this.purchaseRequestsService.inviteCompaniesToBid(
      purchaseRequestId,
      inviteToBidDto,
      user.id,
    );
  }

  @Get(':id/bids')
  @ApiOperation({ summary: 'Get bids for a purchase request' })
  @ApiParam({ name: 'id', description: 'Purchase request ID' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return bids with pagination' })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBids(
    @Param('id', ParseIntPipe) id: number,
    @Query() getBidsDto: GetBidsDto,
  ) {
    return this.purchaseRequestsService.getBids(id, getBidsDto);
  }

  @Post(':pr_id/invite-to-manage')
  // @Roles(KeycloakRole.MODIFY_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Invite agent to manage purchase request' })
  @ApiParam({ name: 'pr_id', description: 'Purchase request ID' })
  @ApiResponse({ status: 201, description: 'Agent invited successfully' })
  @ApiResponse({
    status: 404,
    description: 'Purchase request or agent not found',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async inviteToManage(
    @Param('pr_id', ParseIntPipe) pr_id: number,
    @Body() inviteToManageDto: InviteToManageDto,
    @GetUser() user: User,
  ) {
    return this.purchaseRequestsService.inviteToManage(
      pr_id,
      user.id,
      inviteToManageDto.agentId,
    );
  }

  @Post(':id/publish')
  // @Roles(KeycloakRole.MODIFY_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Publish a draft purchase request' })
  @ApiParam({ name: 'id', description: 'Purchase request ID' })
  @ApiResponse({
    status: 201,
    description: 'Purchase request published successfully',
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async publishDraft(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.purchaseRequestsService.publishDraft(id, user.id);
  }

  @Post(':pr_id/set_status')
  // @Roles(KeycloakRole.MODIFY_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Update purchase request status' })
  @ApiParam({ name: 'pr_id', description: 'Purchase request ID' })
  @ApiResponse({ status: 201, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async approvePurchaseRequest(
    @Param('pr_id', ParseIntPipe) pr_id: number,
    @GetUser() user: User,
    @Body() status: PurchaseRequestStatus,
  ) {
    return this.purchaseRequestsService.setPurchaseRequestStatus(
      pr_id,
      user.id,
      status,
    );
  }

  @Delete(':id')
  // @Roles(KeycloakRole.MODIFY_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Delete a purchase request' })
  @ApiParam({ name: 'id', description: 'Purchase request ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase request deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deletePurchaseRequest(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return await this.purchaseRequestsService.deletePurchaseRequest(id, user);
  }

  @Patch(':id/deadline')
  // @Roles(KeycloakRole.MODIFY_OWN_PURCHASE_REQUESTS)
  @ApiOperation({ summary: 'Update purchase request deadline' })
  @ApiParam({ name: 'id', description: 'Purchase request ID' })
  @ApiResponse({ status: 200, description: 'Deadline updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateDeadline(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeadlineDto: UpdateDeadlineDto,
    @GetUser() user: User,
  ) {
    return this.purchaseRequestsService.updateDeadline(
      id,
      user.id,
      updateDeadlineDto.bidding_deadline,
    );
  }

  @Post('draft')
  @ApiOperation({ summary: 'Create a draft purchase request' })
  @ApiResponse({
    status: 201,
    description: 'Draft purchase request created successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createDraft(
    @Body() createPurchaseRequestDto: Partial<CreatePurchaseRequestDto>,
    @GetUser() user: User,
  ): Promise<PurchaseRequest> {
    return this.purchaseRequestsService.createDraftPurchaseRequest(
      createPurchaseRequestDto,
      user.id,
    );
  }
}
