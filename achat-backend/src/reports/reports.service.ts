import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Report } from './entities/report.entity';
import { Reply } from './entities/reply.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { GetRepliesDto } from './dto/get-replies.dto';
import { LogsService } from 'src/logs/logs.service';
import { LogsType } from 'src/logs/enums/logs.enum';
import { User } from 'src/users/entities/user.entity';
import { ReportStatus } from './enums/report-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { AppRole } from 'src/auth/enums/app-roles.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Reply)
    private repliesRepository: Repository<Reply>,
    private logsService: LogsService,
  ) {}

  async create(createReportDto: CreateReportDto, user: User) {
    const reportReference = `REP-${uuidv4()}`;

    const report = this.reportsRepository.create({
      ...createReportDto,
      creator: user,
      status: ReportStatus.OPEN,
      report_reference: reportReference,
    });

    await this.reportsRepository.save(report);

    await this.logsService.createLog({
      action_type: LogsType.CREATE_REPORT,
      action: `Created report: ${report.title} (${report.report_reference})`,
      user_id: user.id,
    });

    return report;
  }

  async findAll({
    user,
    status,
    page = 1,
    limit = 10,
  }: {
    user: User & { permissions?: string[] };
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportsRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.creator', 'creator')
      .select([
        'report.id',
        'report.title',
        'report.description',
        'report.status',
        'report.createdAt',
        'report.updatedAt',
        'creator.username',
      ]);

    if (
      !user.permissions.includes(AppRole.MANAGE_ALL_REPORTS) &&
      !user.permissions.includes(AppRole.READ_ALL_REPORTS)
    ) {
      queryBuilder.andWhere('report.creator.id = :userId', { userId: user.id });
    }

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    queryBuilder.orderBy('report.createdAt', 'DESC').skip(skip).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      reports,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number, user: User & { permissions?: string[] }) {
    const queryBuilder = this.reportsRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.replies', 'replies')
      .leftJoinAndSelect('report.creator', 'creator')
      .leftJoinAndSelect('replies.creator', 'replyCreator')
      .where('report.id = :id', { id });

    if (
      !user.permissions.includes(AppRole.MANAGE_ALL_REPORTS) &&
      !user.permissions.includes(AppRole.READ_ALL_REPORTS)
    ) {
      queryBuilder.andWhere('report.creator.id = :userId', { userId: user.id });
    }

    const report = await queryBuilder
      .select([
        'report.id',
        'report.title',
        'report.description',
        'report.status',
        'report.createdAt',
        'report.updatedAt',
        'creator.username',
        'replies.id',
        'replies.message',
        'replies.createdAt',
        'replyCreator.username',
      ])
      .getOne();

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async getReplies(id: number, getRepliesDto: GetRepliesDto) {
    const { page = 1, limit = 10 } = getRepliesDto;

    const queryBuilder = this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.creator', 'creator')
      .where('reply.reportId = :id', { id })
      .select([
        'reply.id',
        'reply.message',
        'reply.createdAt',
        'creator.username',
      ])
      .orderBy('reply.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const replies = await queryBuilder.getMany();
    const total = await this.repliesRepository.count({
      where: { reportId: id },
    });
    const totalPages = Math.ceil(total / limit);

    return {
      replies,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async addReply(id: number, createReplyDto: CreateReplyDto, user: User) {
    const report = await this.reportsRepository.findOne({
      where: {
        id,
        status: In([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]),
      },
    });

    if (!report) {
      throw new NotFoundException(
        `Report with ID ${id} not found or not in an open/in-progress state.`,
      );
    }

    const reply = this.repliesRepository.create({
      ...createReplyDto,
      createdBy: user.id,
      reportId: id,
    });

    await this.repliesRepository.save(reply);

    await this.logsService.createLog({
      action_type: LogsType.ADD_REPLY,
      user_id: user.id,
      action: `Added reply to report: ${report.title}`,
    });

    return reply;
  }

  async updateReportStatus(id: number, status: ReportStatus, user: User) {
    const report = await this.reportsRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    report.status = status;
    await this.reportsRepository.save(report);

    const formattedStatus = status.replace('_', ' ').toLowerCase();
    await this.logsService.createLog({
      action_type: LogsType.UPDATE_REPORT,
      action: `Updated report status to ${formattedStatus}: ${report.title}`,
      user_id: user.id,
    });

    return report;
  }
}
