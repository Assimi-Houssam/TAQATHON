import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto, LogFilterDto } from './dto/log.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createLog(createLogDto: CreateLogDto): Promise<Log> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: createLogDto.user_id },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createLogDto.user_id} not found`,
        );
      }

      const log = this.logRepository.create({
        ...createLogDto,
        user: user,
      });

      return await this.logRepository.save(log);
    } catch (error) {
      throw error;
    }
  }

  async findLogs(
    filterDto: LogFilterDto,
    currentUser: User,
  ): Promise<{ logs: Log[]; total: number; page: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      actionType,
      startDate,
      endDate,
      search,
    } = filterDto;

    const skip = (page - 1) * limit;

    try {
      const queryBuilder = this.logRepository
        .createQueryBuilder('log')
        .leftJoinAndSelect('log.user', 'user')
        .select([
          'log.id',
          'log.action_type',
          'log.action',
          'log.created_at',
          'user.id',
          'user.username',
        ])
        .orderBy('log.created_at', 'DESC')
        .andWhere('log.user_id = :currentUserId', {
          currentUserId: currentUser.id,
        });

      if (actionType) {
        queryBuilder.andWhere('log.action_type = :actionType', { actionType });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('log.created_at BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      }

      if (search) {
        queryBuilder.andWhere('log.action LIKE :search', {
          search: `%${search}%`,
        });
      }

      const [logs, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async findLogById(id: number, currentUser: User): Promise<Log> {
    try {
      const log = await this.logRepository.findOne({
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          action_type: true,
          action: true,
          created_at: true,
          user: {
            id: true,
            username: true,
          },
        },
      });

      if (!log) {
        throw new NotFoundException(`Log with ID ${id} not found`);
      }

      if (log.user.id !== currentUser.id) {
        throw new ForbiddenException('You do not have permission to view this log');
      }

      return log;
    } catch (error) {
      throw error;
    }
  }
}
