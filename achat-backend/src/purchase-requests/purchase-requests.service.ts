import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { PurchaseRequestChatService } from 'src/chats/services/purchase-request-chat.service';
import { Departement } from 'src/departements/entities/departement.entity';
import { Document } from 'src/documents/entities/doc.entity';
import { LogsType } from 'src/logs/enums/logs.enum';
import { LogsService } from 'src/logs/logs.service';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { NotificationPayload } from 'types/notification.type';
import { Company } from '../companies/entities/company.entity';
import { NotificationType } from '../notifications/enums/notification.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { GetBidsDto } from './dto/get-bids.dto';
import { InviteToBidDto } from './dto/invite-to-bid.dto';
import { PurchaseRequest } from './entities/purchase-request.entity';
import {
  PRVisibilityType,
  PurchaseRequestStatus,
} from './enums/purchase-request.enum';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly notificationsService: NotificationsService,
    private readonly logsService: LogsService,
    private readonly purchaseRequestChatService: PurchaseRequestChatService,
    @InjectRepository(Departement)
    private readonly departementRepository: Repository<Departement>,
    private readonly mailService: MailService,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  async inviteCompaniesToBid(
    purchaseRequestId: number,
    inviteToBidDto: InviteToBidDto,
    userId: number,
  ) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId },
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    const companies = await this.companyRepository.findBy({
      id: In(inviteToBidDto.companyIds),
    });

    if (companies.length !== inviteToBidDto.companyIds.length) {
      throw new BadRequestException('One or more companies not found');
    }

    purchaseRequest.companies = [...purchaseRequest.companies, ...companies];

    await this.purchaseRequestRepository.save(purchaseRequest);

    for (const company of companies) {
      const companyMembers = company.members || [];
      if (companyMembers.length > 0) {
        const notification: NotificationPayload = {
          type: NotificationType.NEW_PURCHASE_REQUEST,
          creator: { id: userId } as User,
          message: `You have been invited to bid on purchase request "${purchaseRequest.title}".`,
          isPublic: false,
          users: companyMembers,
          purchaseRequest: purchaseRequest,
        };

        await this.notificationsService.createAndSendNotification(notification);
      }
    }

    await this.logsService.createLog({
      action_type: LogsType.PURCHASE_REQUEST,
      action: `Companies invited to bid on purchase request "${purchaseRequest.title}"`,
      user_id: userId,
    });
  }

  async getBids(
    purchaseRequestId: number,
    getBidsDto: GetBidsDto,
  ): Promise<{ data: Bid[]; total: number }> {
    try {
      const { query, page, limit } = getBidsDto;
      const skip = (page - 1) * limit;

      const purchaseRequest = await this.purchaseRequestRepository.findOne({
        where: { id: purchaseRequestId },
      });

      if (!purchaseRequest) {
        throw new NotFoundException(
          `Purchase request with ID ${purchaseRequestId} not found`,
        );
      }

      const queryBuilder = this.bidRepository
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
        });

      if (query) {
        queryBuilder.andWhere('bid.bid_reference ILIKE :query', {
          query: `%${query}%`,
        });
      }

      const [bids, total] = await queryBuilder
        .orderBy('bid.created_at', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        data: bids,
        total,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to list bids');
    }
  }

  async createPurchaseRequest(
    createPurchaseRequestDto: CreatePurchaseRequestDto,
    userId: number,
  ): Promise<PurchaseRequest> {
    return await this.purchaseRequestRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const buyingDepartment = await this.departementRepository.findOne({
          where: { id: createPurchaseRequestDto.department },
        });

        if (!buyingDepartment) {
          throw new NotFoundException('Department not found');
        }

        // Create the purchase request
        const purchaseRequest = this.purchaseRequestRepository.create({
          title: createPurchaseRequestDto.requestTitle,
          description: createPurchaseRequestDto.notes,
          bidding_deadline: new Date(createPurchaseRequestDto.settings.dueDate),
          delivery_date: new Date(createPurchaseRequestDto.deliveryDate),
          delivery_address: createPurchaseRequestDto.deliveryAddress,
          purchase_visibility: PRVisibilityType.PUBLIC,
          buying_department: buyingDepartment,
          owner: { id: userId } as User,
          biding_address: createPurchaseRequestDto.deliveryAddress,
          biding_date: new Date(),
          category: createPurchaseRequestDto.itemType,
          status: PurchaseRequestStatus.WAITING_FOR_APPROVAL,
          request_code: `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });

        // Save the purchase request first
        const savedRequest = await transactionalEntityManager.save(
          PurchaseRequest,
          purchaseRequest,
        );

        if (createPurchaseRequestDto.attachments?.length) {
          const documents = await transactionalEntityManager.find(Document, {
            where: { id: In(createPurchaseRequestDto.attachments) },
          });

          if (
            documents.length !== createPurchaseRequestDto.attachments.length
          ) {
            throw new BadRequestException('One or more documents not found');
          }

          await Promise.all(
            documents.map((doc) =>
              transactionalEntityManager.update(
                Document,
                { id: doc.id },
                {
                  isLinked: true,
                },
              ),
            ),
          );

          savedRequest.documents = documents;
          // Set the attachments on the purchase request
          await transactionalEntityManager.save(PurchaseRequest, savedRequest);
        }

        // Create chat room for the purchase request
        // const owner = await transactionalEntityManager
        //   .createQueryBuilder(PurchaseRequest, 'pr')
        //   .leftJoinAndSelect('pr.owner', 'owner')
        //   .where('pr.id = :id', { id: savedRequest.id })
        //   .getOne();

        // await this.purchaseRequestChatService.createPurchaseRequestChat(
        //   savedRequest,
        //   owner.owner,
        // );

        // Create log entry
        await this.logsService.createLog({
          action_type: LogsType.PURCHASE_REQUEST,
          action: `Purchase request "${purchaseRequest.title}" created`,
          user_id: userId,
        });

        return savedRequest;
      },
    );
  }

  async getPurchaseRequests(
    userId: number,
    status?: PurchaseRequestStatus,
  ): Promise<PurchaseRequest[]> {
    const query = this.purchaseRequestRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.owner', 'owner')
      .leftJoinAndSelect('pr.buying_department', 'department')
      .where('owner.id = :userId', { userId });

    if (status) {
      query.andWhere('pr.status = :status', { status });
    }

    return query.getMany();
  }

  async getPurchaseRequestById(
    PR_ref: string,
    userId: number,
  ): Promise<PurchaseRequest> {
    try {
      const purchaseRequest = await this.purchaseRequestRepository
        .createQueryBuilder('pr')
        .leftJoinAndSelect('pr.owner', 'owner')
        .leftJoinAndSelect('pr.buying_department', 'department')
        .leftJoinAndSelect('pr.documents', 'documents')
        .leftJoinAndSelect('pr.agents', 'agents')
        .leftJoinAndSelect('pr.companies', 'companies')
        .leftJoinAndSelect('pr.bids', 'bids')
        .where('pr.request_code = :PR_ref', { PR_ref })
        .getOne();

      if (!purchaseRequest) {
        throw new NotFoundException(
          `Purchase request with ID ${PR_ref} not found`,
        );
      }

      // Check if user has access to this purchase request
      // const hasAccess =
      //   purchaseRequest.owner.id === userId || // Is owner
      //   purchaseRequest.agents.some((agent) => agent.id === userId); // Is agent

      // if (!hasAccess) {
      //   throw new NotFoundException(`Purchase request with ID ${id} not found`);
      // }

      return purchaseRequest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the purchase request',
      );
    }
  }

  async getDraftPurchaseRequests(userId: number): Promise<PurchaseRequest[]> {
    const draftPurchaseRequests = await this.purchaseRequestRepository
      .createQueryBuilder('purchase_request')
      // .where('purchase_request.owner_id = :userId', { userId })
      .where('purchase_request.status = :status', {
        status: PurchaseRequestStatus.DRAFT,
      })
      .getMany();

    return draftPurchaseRequests;
  }

  async publishDraft(purchaseRequestId: number, userId: number) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId, owner: { id: userId } },
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    if (purchaseRequest.status !== PurchaseRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft purchase requests can be published',
      );
    }

    purchaseRequest.status = PurchaseRequestStatus.SCHEDULED;
    await this.purchaseRequestRepository.save(purchaseRequest);

    await this.logsService.createLog({
      action_type: LogsType.PURCHASE_REQUEST,
      action: `Purchase request "${purchaseRequest.title}" published from draft`,
      user_id: userId,
    });
  }

  async deletePurchaseRequest(purchaseRequestId: number, user: User) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId },
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    if (purchaseRequest.status !== PurchaseRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft purchase requests can be deleted',
      );
    }

    await this.purchaseRequestRepository.remove(purchaseRequest);

    await this.logsService.createLog({
      action_type: LogsType.PURCHASE_REQUEST,
      action: `Purchase request "${purchaseRequest.title}" deleted`,
      user_id: user?.id,
    });
  }

  async updateDeadline(
    purchaseRequestId: number,
    userId: number,
    bidding_deadline: Date,
  ) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId },
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    if (purchaseRequest.status === PurchaseRequestStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot update deadline of a rejected purchase request',
      );
    }

    purchaseRequest.bidding_deadline = bidding_deadline;
    await this.purchaseRequestRepository.save(purchaseRequest);

    await this.logsService.createLog({
      action_type: LogsType.PURCHASE_REQUEST,
      action: `Deadline updated for purchase request "${purchaseRequest.title}" to ${bidding_deadline}`,
      user_id: userId,
    });
  }

  async inviteToManage(
    purchaseRequestId: number,
    userId: number,
    agentId: number,
  ) {
    // Find purchase request with owner and agents relations
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId },
      relations: ['owner', 'agents'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    if (purchaseRequest.owner.id !== userId) {
      throw new BadRequestException(
        'Only the owner can invite agents to manage the purchase request',
      );
    }

    // Check if purchase request is in a valid status
    if (purchaseRequest.status === PurchaseRequestStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot invite agents to a rejected purchase request',
      );
    }

    const isAlreadyAgent = purchaseRequest.agents.some(
      (agent) => agent.id === agentId,
    );
    if (isAlreadyAgent) {
      throw new BadRequestException(
        'Agent is already managing this purchase request',
      );
    }

    purchaseRequest.agents = [
      ...(purchaseRequest.agents || []),
      { id: agentId } as User,
    ];

    await this.purchaseRequestRepository.save(purchaseRequest);

    const notification: NotificationPayload = {
      type: NotificationType.BID_INVIATION,
      creator: { id: userId } as User,
      message: `You have been invited to bid on purchase request "${purchaseRequest.title}"`,
      isPublic: false,
      users: [{ id: agentId } as User],
      purchaseRequest: purchaseRequest,
    };

    await this.notificationsService.createAndSendNotification(notification);
    await this.mailService.sendInviteAgentToPurchaseRequestMail(
      { id: agentId } as User,
      purchaseRequest,
      purchaseRequest.owner.company,
    );
    await this.logsService.createLog({
      action_type: LogsType.PURCHASE_REQUEST,
      action: `Agent (ID: ${agentId}) invited to manage purchase request "${purchaseRequest.title}"`,
      user_id: userId,
    });
  }

  async setPurchaseRequestStatus(
    purchaseRequestId: number,
    userId: number,
    newStatus: PurchaseRequestStatus,
  ) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId },
      relations: ['owner'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    // Define allowed status transitions
    const allowedStatuses = [
      PurchaseRequestStatus.REJECTED,
      PurchaseRequestStatus.FINISHED,
      PurchaseRequestStatus.PUBLISHED,
      PurchaseRequestStatus.SCHEDULED,
    ];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot set status to ${newStatus}. Only ${allowedStatuses.join(
          ', ',
        )} are allowed.`,
      );
    }

    // Validate state transitions
    const currentStatus = purchaseRequest.status;

    // Can only transition from DRAFT or WAITING_FOR_APPROVAL to PUBLISHED/SCHEDULED/REJECTED
    if (
      currentStatus !== PurchaseRequestStatus.DRAFT &&
      currentStatus !== PurchaseRequestStatus.WAITING_FOR_APPROVAL &&
      (newStatus === PurchaseRequestStatus.PUBLISHED ||
        newStatus === PurchaseRequestStatus.SCHEDULED ||
        newStatus === PurchaseRequestStatus.REJECTED)
    ) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Purchase request must be in DRAFT or WAITING_FOR_APPROVAL state.`,
      );
    }

    // Update the status
    purchaseRequest.status = newStatus;
    await this.purchaseRequestRepository.save(purchaseRequest);

    // Create log entry
    await this.logsService.createLog({
      action_type: LogsType.PURCHASE_REQUEST,
      action: `Purchase request "${purchaseRequest.title}" status changed from ${currentStatus} to ${newStatus}`,
      user_id: userId,
    });

    // If status is changed to PUBLISHED or SCHEDULED, notify the owner
    if (
      newStatus === PurchaseRequestStatus.PUBLISHED ||
      newStatus === PurchaseRequestStatus.SCHEDULED
    ) {
      const notification: NotificationPayload = {
        type: NotificationType.NEW_PURCHASE_REQUEST,
        creator: { id: userId } as User,
        message: `Your purchase request "${purchaseRequest.title}" has been ${newStatus.toLowerCase()}`,
        isPublic: false,
        users: [purchaseRequest.owner],
        purchaseRequest: purchaseRequest,
      };

      await this.notificationsService.createAndSendNotification(notification);
    }

    return purchaseRequest;
  }

  async createDraftPurchaseRequest(
    createPurchaseRequestDto: Partial<CreatePurchaseRequestDto>,
    userId: number,
  ): Promise<PurchaseRequest> {
    return await this.purchaseRequestRepository.manager.transaction(
      async (transactionalEntityManager) => {
        let buyingDepartment;
        if (createPurchaseRequestDto.department) {
          buyingDepartment = await this.departementRepository.findOne({
            where: { id: createPurchaseRequestDto.department },
          });
        }

        // Create the draft purchase request with minimal required fields
        const purchaseRequest = this.purchaseRequestRepository.create({
          title: createPurchaseRequestDto.requestTitle || 'No title',
          description: createPurchaseRequestDto.notes,
          bidding_deadline: createPurchaseRequestDto.settings?.dueDate
            ? new Date(createPurchaseRequestDto.settings.dueDate)
            : null,
          delivery_date: createPurchaseRequestDto.deliveryDate
            ? new Date(createPurchaseRequestDto.deliveryDate)
            : null,
          delivery_address: createPurchaseRequestDto.deliveryAddress || null,
          purchase_visibility: PRVisibilityType.PUBLIC,
          buying_department: buyingDepartment,
          owner: { id: userId } as User,
          biding_address: createPurchaseRequestDto.deliveryAddress || null,
          biding_date: null,
          category: createPurchaseRequestDto.itemType || null,
          status: PurchaseRequestStatus.DRAFT,
          request_code: `PR-DRAFT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });

        // Save the draft request
        const savedRequest = await transactionalEntityManager.save(
          PurchaseRequest,
          purchaseRequest,
        );

        // Handle attachments if any
        if (createPurchaseRequestDto.attachments?.length) {
          const documents = await transactionalEntityManager.find(Document, {
            where: { id: In(createPurchaseRequestDto.attachments) },
          });

          if (documents.length > 0) {
            await Promise.all(
              documents.map((doc) =>
                transactionalEntityManager.update(
                  Document,
                  { id: doc.id },
                  { isLinked: true },
                ),
              ),
            );

            savedRequest.documents = documents;
            await transactionalEntityManager.save(
              PurchaseRequest,
              savedRequest,
            );
          }
        }

        // Create log entry
        await this.logsService.createLog({
          action_type: LogsType.PURCHASE_REQUEST,
          action: `Draft purchase request "${purchaseRequest.title}" created`,
          user_id: userId,
        });

        return savedRequest;
      },
    );
  }
}
