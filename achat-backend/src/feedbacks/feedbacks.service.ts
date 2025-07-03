import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { GetFeedbacksDto } from './dto/get-feedbacks.dto';
import { LogsService } from 'src/logs/logs.service';
import { LogsType } from 'src/logs/enums/logs.enum';
import { CompaniesService } from 'src/companies/companies.service';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/enums/notification.enum';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { Bid } from 'src/bids/entities/bid.entity';
@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private feedbacksRepository: Repository<Feedback>,
    @InjectRepository(PurchaseRequest)
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private logsService: LogsService,
    private notificationsService: NotificationsService,
  ) {}

  async createFeedback(createFeedbackDto: CreateFeedbackDto, agent: User) {
    const { description, rating, supplierId, purchaseRequestId } =
      createFeedbackDto;

    const supplier = await this.usersService.findUser(supplierId);

    if (!supplier) {
      throw new NotFoundException(`User with ID ${supplierId} not found`);
    }

    if (!supplier.company) {
      throw new NotFoundException(
        `User ${supplierId} is not associated with any company`,
      );
    }

    const existingBid = await this.bidRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.purchase_request', 'purchase_request')
      .leftJoinAndSelect('bid.company', 'company')
      .where('company.id = :companyId', { companyId: supplier.company.id })
      .where('purchase_request.id = :purchaseRequestId', { purchaseRequestId })
      .getOne();

    if (!existingBid) {
      throw new ForbiddenException(
        'Feedback can only be submitted for suppliers who have previously worked on this purchase request.',
      );
    }

    const feedback = this.feedbacksRepository.create({
      description,
      rating,
      supplier: supplier.company,
      agent,
      purchase_request: existingBid.purchase_request,
      bid: existingBid,
    });

    await this.feedbacksRepository.save(feedback);

    await this.logsService.createLog({
      action_type: LogsType.FEEDBACK,
      action: `Feedback created for supplier ${supplier.first_name} ${supplier.last_name} (${supplier.company.legal_name}) on purchase request ${purchaseRequestId}`,
      user_id: agent.id,
    });

    const companyUsers = await this.usersService.findUsersByCompanyId(
      supplier.company.id,
    );

    if (companyUsers.length > 0) {
      await this.notificationsService.createAndSendNotification({
        type: NotificationType.FEEDBACK,
        creator: agent,
        message: `New feedback received from ${agent.first_name} ${agent.last_name} for purchase request ${purchaseRequestId}`,
        isPublic: false,
        users: companyUsers,
      });
    }
  }

  async getFeedbacksBySupplier(
    id: number,
    query: GetFeedbacksDto,
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
    const { page, limit } = query;
    const supplier = await this.usersService.findUser(id);
    if (!supplier) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const [feedbacks, total] = await this.feedbacksRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.agent', 'agent')
      .select([
        'feedback.id',
        'feedback.description',
        'feedback.rating',
        'agent.id',
        'agent.first_name',
        'agent.last_name',
        'agent.avatar',
      ])
      .where('feedback.supplier = :id', { id })
      .orderBy('feedback.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const formattedFeedbacks = feedbacks.map((feedback) => ({
      id: feedback.id,
      description: feedback.description,
      rating: feedback.rating,
      agent: {
        id: feedback.agent.id,
        first_name: feedback.agent.first_name,
        last_name: feedback.agent.last_name,
        avatar: feedback.agent.avatar.toString(),
      },
    }));

    return { data: formattedFeedbacks, page, limit, total };
  }

  async updateFeedback(
    id: number,
    updateFeedbackDto: UpdateFeedbackDto,
    user: User,
  ) {
    const feedback = await this.feedbacksRepository.findOne({
      where: { id },
      relations: ['agent'],
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    if (feedback.agent.id != user.id) {
      throw new ForbiddenException('You can only update your own feedback');
    }

    Object.assign(feedback, updateFeedbackDto);

    await this.logsService.createLog({
      action_type: LogsType.FEEDBACK,
      action: `Feedback ${id} updated by user ${user.id}`,
      user_id: user.id,
    });

    this.feedbacksRepository.save(feedback);
  }

  async deleteFeedback(id: number, user: User) {
    const feedback = await this.feedbacksRepository.findOne({
      where: { id },
      relations: ['agent'],
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    if (feedback.agent.id !== user.id) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    await this.logsService.createLog({
      action_type: LogsType.FEEDBACK,
      action: `Feedback ${id} deleted by user ${user.id}`,
      user_id: user.id,
    });

    this.feedbacksRepository.remove(feedback);
  }
}
