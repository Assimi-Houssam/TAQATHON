import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { DataSource, Repository } from 'typeorm';
import { NotificationsService } from 'src/notifications/notifications.service';
import { LogsService } from 'src/logs/logs.service';
import { CreateBidDto, ShowInterestDto } from './dto/create-bid.dto';
import { LatestBidsDto } from './dto/latest-bid.dto';
import { User } from 'src/users/entities/user.entity';
import { LogsType } from 'src/logs/enums/logs.enum';
import {
  PRVisibilityType,
  PurchaseRequestStatus,
} from '../purchase-requests/enums/purchase-request.enum';
import { NotificationType } from 'src/notifications/enums/notification.enum';
import { Company } from 'src/companies/entities/company.entity';
import { BidStatus } from './enums/bids.enum';
import { v4 as uuidv4 } from 'uuid';
import { CompanyStatus } from 'src/companies/enums/company.enum';
import { MailService } from 'src/mail/mail.service';
import { plainToInstance } from 'class-transformer';
// import { PurchaseRequestChatService } from 'src/chats/services/purchase-request-chat.service';
import { BidStats } from './interfaces/bid-stats.interface';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly logsService: LogsService,
    private readonly dataSource: DataSource,
    // private readonly purchaseRequestChatService: PurchaseRequestChatService,
    private readonly mailService: MailService,
  ) {}

  async getDashboardStats(): Promise<BidStats> {
    const total = await this.bidRepository.count();
    const won = await this.bidRepository.count({
      where: { bid_status: BidStatus.AWARDED },
    });
    const pending = await this.bidRepository.count({
      where: { bid_status: BidStatus.PENDING },
    });
    const rejected = await this.bidRepository.count({
      where: { bid_status: BidStatus.DISQUALIFIED },
    });
    const closed = won; // Assuming AWARDED status means closed

    return {
      total,
      closed,
      won,
      pending,
      rejected
    };
  }

  async createBid(createBidDto: CreateBidDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseRequest = await this.validatePurchaseRequestVisibility(
        createBidDto.purchase_request_id,
        createBidDto.company_id,
      );

      const company = await this.companyRepository.findOne({
        where: { id: createBidDto.company_id, members: { id: user.id } },
      });
      if (!company) {
        throw new NotFoundException(
          `No company with ID ${createBidDto.company_id} found associated with this user.`,
        );
      }

      if (company.active_status === CompanyStatus.LOCKED) {
        throw new ForbiddenException(
          `Cannot create bid: Company is locked${company.lock_reason ? ` - ${company.lock_reason}` : ''}`,
        );
      }

      if (
        purchaseRequest.purchase_visibility === PRVisibilityType.PRIVATE &&
        !purchaseRequest.companies.some(
          (participant: Company) => participant.id === company.id,
        )
      ) {
        throw new ForbiddenException(
          'Your company is not invited to bid on this purchase request',
        );
      }

      const hasExistingBid = purchaseRequest.bids.some(
        (bid: Bid) =>
          bid.company.id === company.id &&
          bid.bid_status != BidStatus.SHOWED_INTEREST &&
          bid.bid_status != BidStatus.DISQUALIFIED,
      );

      if (hasExistingBid) {
        throw new BadRequestException(
          'Your company has already submitted a bid for this purchase request',
        );
      }

      if (new Date() > purchaseRequest.bidding_deadline) {
        throw new BadRequestException('Bidding deadline has passed');
      }

      const bidReference = `BID-${uuidv4()}`;

      const bid = this.bidRepository.create({
        ...createBidDto,
        bid_reference: bidReference,
        company,
        purchase_request: purchaseRequest,
      });

      const savedBid = await queryRunner.manager.save(bid);
      await queryRunner.commitTransaction();

      //! Add bidder to chat?
      //   await this.purchaseRequestChatService.addBidderToChat(savedBid, user);

      await this.notificationsService.createAndSendNotification({
        type: NotificationType.NEW_BID,
        creator: user,
        message: `New bid ${savedBid.bid_reference} has been submitted for purchase request "${purchaseRequest.title}"`,
        isPublic: false,
        users: [purchaseRequest.owner],
        bid: savedBid,
        purchaseRequest: purchaseRequest,
      });

      await this.mailService.sendBidCreatedMail(savedBid);

      await this.logsService.createLog({
        action_type: LogsType.BID,
        action: `Bid created for purchase request ${purchaseRequest.request_code}`,
        user_id: user.id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create bid');
    } finally {
      await queryRunner.release();
    }
  }

  async showInterestBid(showInterestDto: ShowInterestDto, user: User) {
    const company = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['company'],
    });

    if (!company) {
      throw new NotFoundException(
        `Company not found for user with ID ${user.id}`,
      );
    }

    const purchaseRequest = await this.validatePurchaseRequestVisibility(
      showInterestDto.purchase_request_id,
      company.id,
    );

    const aleardyExistingBids = await this.bidRepository.find({
      where: {
        company: company,
        purchase_request: purchaseRequest,
      },
    });

    if (aleardyExistingBids.length > 0) {
      throw new BadRequestException(
        'Your company has already submitted a bid for this purchase request',
      );
    }

    const bid = this.bidRepository.create({
      company,
      purchase_request: purchaseRequest,
      bid_status: BidStatus.SHOWED_INTEREST,
    });

    await this.logsService.createLog({
      action_type: LogsType.BID,
      action: `Company ${user.company.legal_name} showed interest in purchase request ${purchaseRequest.request_code}`,
      user_id: user.id,
    });

    await this.bidRepository.save(bid);
  }

  private async validatePurchaseRequestVisibility(
    purchaseRequestId: number,
    companyId: number,
  ): Promise<PurchaseRequest> {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: {
        id: purchaseRequestId,
        status:
          PurchaseRequestStatus.PUBLISHED || PurchaseRequestStatus.SCHEDULED,
      },
      relations: ['companies', 'bids', 'owner'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Open purchase request with ID ${purchaseRequestId} not found.`,
      );
    }

    if (
      purchaseRequest.purchase_visibility === PRVisibilityType.PRIVATE &&
      !purchaseRequest.companies.some(
        (participant: Company) => participant.id === companyId,
      )
    ) {
      throw new ForbiddenException(
        'Your company is not invited to interact with this purchase request',
      );
    }

    return purchaseRequest;
  }

  async getLatestBid(purchaseRequestId: number): Promise<LatestBidsDto[]> {
    try {
      const purchaseRequest = await this.purchaseRequestRepository.findOne({
        where: { id: purchaseRequestId },
      });

      if (!purchaseRequest) {
        throw new NotFoundException(
          `Purchase request with ID ${purchaseRequestId} not found`,
        );
      }

      const bids = await this.bidRepository
        .createQueryBuilder('bid')
        .leftJoinAndSelect('bid.company', 'company')
        .select([
          'bid.id',
          'bid.bid_reference',
          'bid.bid_status',
          'bid.bid_description',
          'bid.delivery_date',
          'bid.delivery_address',
          'bid.biding_date',
          'bid.biding_address',
          'bid.created_at',
          'bid.updated_at',
          'company.id',
          'company.legal_name',
          'company.company_phone',
          'company.email',
          'company.address',
        ])
        .where('bid.purchaseRequestId = :purchaseRequestId', {
          purchaseRequestId,
        })
        .orderBy('bid.created_at', 'DESC')
        .getMany();

      if (bids.length === 0) {
        return [];
      }

      const latestBidsByCompany = bids.reduce((acc, bid) => {
        const companyId = bid.company.id;
        if (
          !acc.has(companyId) ||
          acc.get(companyId).created_at < bid.created_at
        ) {
          acc.set(companyId, bid);
        }
        return acc;
      }, new Map<number, Bid>());

      const latestBids = Array.from(latestBidsByCompany.values());
      return plainToInstance(LatestBidsDto, latestBids);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get latest bids');
    }
  }
}
