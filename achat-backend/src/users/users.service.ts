import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, DataSource, In } from 'typeorm';
import { User } from './entities/user.entity';
import { EntityTypes } from './enums/user.enum';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { SupplierStatusAction } from './enums/user.enum';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { LogsService } from 'src/logs/logs.service';
import { LogsType } from 'src/logs/enums/logs.enum';
import { DocumentService } from 'src/documents/doc.service';
import { GetUsersDto } from './dto/get-users.dto';
import { DocumentType } from 'src/documents/enum/doc.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private logsService: LogsService,
    private readonly dataSource: DataSource,
    private documentService: DocumentService,
  ) {}

  async getOrCreateDatabaseUser(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user) {
      // !!!!!
      // This is a temporary solution to create a user in the database
      // This should be removed once the signup flow is implemented
      // and the keycloak user is created at the same time as the database user
      // !!!!!!
      const new_user = this.usersRepository.create({
        username,
        first_name: username,
        last_name: username,
        entity_type: EntityTypes.OCP_AGENT,
        phone_number: '000000000',
      });
      await this.usersRepository.save(new_user);
      return new_user;
    }

    return user;
  }

  async findUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['avatar', 'company'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAllUsers(
    are_agents: boolean,
    { page = 1, limit = 10, search, sort, departements }: GetUsersDto,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Input validation
      if (page < 1 || limit < 1) {
        throw new BadRequestException(
          'Page and limit must be positive numbers',
        );
      }

      // Build base query
      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.company', 'company')
        .leftJoinAndSelect('user.avatar', 'avatar')
        .leftJoinAndSelect('user.departements', 'departements')
        .select([
          'user.id',
          'user.email',
          'user.first_name',
          'user.last_name',
          'user.username',
          'user.phone_number',
          'user.entity_type',
          'user.is_active',
          'user.created_at',
          'company.id',
          'avatar.id',
          'departements.id',
          'departements.name',
        ])
        .where('user.entity_type = :entityType', {
          entityType: are_agents ? EntityTypes.OCP_AGENT : EntityTypes.SUPPLIER,
        });

      // Add search conditions if search parameter exists
      if (search?.trim()) {
        const searchTerm = `%${search.trim()}%`;
        queryBuilder.andWhere(
          '(user.email ILIKE :search OR ' +
            'user.first_name ILIKE :search OR ' +
            'user.last_name ILIKE :search OR ' +
            'user.username ILIKE :search OR ' +
            'user.phone_number ILIKE :search)',
          { search: searchTerm },
        );
      }

      // Add departments filter if provided
      if (departements?.length) {
        queryBuilder.andWhere('departements.id IN (:...departementIds)', {
          departementIds: departements,
        });
      }

      // Add sorting
      if (sort?.trim()) {
        const [sortField, sortOrder] = sort.split(':');
        const validSortFields = [
          'email',
          'first_name',
          'last_name',
          'created_at',
        ];

        if (!validSortFields.includes(sortField)) {
          throw new BadRequestException(
            `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`,
          );
        }

        queryBuilder.orderBy(
          `user.${sortField}`,
          sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      } else {
        queryBuilder.orderBy('user.created_at', 'DESC');
      }

      // Add pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [users, total] = await queryBuilder.getManyAndCount();

      // Transform results
      const transformedUsers = users.map((user) => ({
        ...user,
        companyId:
          user.entity_type === EntityTypes.SUPPLIER
            ? user.company?.id
            : undefined,
        company: undefined,
      }));

      return {
        users: transformedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
        {
          cause: error,
          description: 'Error occurred while fetching users from database',
        },
      );
    }
  }

  async toggleSupplierStatus(
    id: number,
    status: SupplierStatusAction,
    agent?: User,
  ) {
    return await this.usersRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const supplier = await transactionalEntityManager
          .createQueryBuilder(User, 'user')
          .where('user.id = :id', { id })
          .andWhere('user.entity_type = :entityType', {
            entityType: EntityTypes.SUPPLIER,
          })
          .getOne();

        if (!supplier) {
          throw new NotFoundException(
            `Supplier with ID ${id} not found or is not a supplier`,
          );
        }

        const newStatus = status === SupplierStatusAction.ACTIVATE;
        const previousStatus = supplier.is_active;

        if (previousStatus === newStatus) {
          const actionState = newStatus ? 'activated' : 'deactivated';
          throw new BadRequestException(
            `Operation failed: Supplier #${id} is already ${actionState}`,
          );
        }
        supplier.is_active = newStatus;
        await transactionalEntityManager.save(supplier);
        await this.logsService.createLog({
          action_type: LogsType.PROFILE,
          previous_status: previousStatus ? 'active' : 'inactive',
          action: `Changed supplier ${supplier.id} account status to ${
            newStatus ? 'active' : 'inactive'
          }`,
          user_id: agent?.id,
        });
      },
    );
  }

  async updateSupplierData(
    id: number,
    updateData: UpdateAgentDto,
  ): Promise<User> {
    const supplier = await this.usersRepository.findOne({
      where: { id, entity_type: EntityTypes.SUPPLIER },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    Object.assign(supplier, updateData);

    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      action: `Updated supplier ${supplier.id} information`,
      user_id: supplier.id,
    });

    return this.usersRepository.save(supplier);
  }

  async updateAgentInfo(id: number, updateData: Partial<User>): Promise<User> {
    const agent = await this.usersRepository.findOne({
      where: { id, entity_type: EntityTypes.OCP_AGENT },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    if (updateData.phone_number !== undefined) {
      agent.phone_number = updateData.phone_number;
    }
    if (updateData.birth_date !== undefined) {
      agent.birth_date = new Date(updateData.birth_date);
    }

    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      action: `Updated agent ${agent.id} information`,
      user_id: agent.id,
    });

    return this.usersRepository.save(agent);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        verification_token: token,
        is_verified: false,
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (new Date() > user.verification_expires) {
      throw new BadRequestException('Verification token has expired');
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_expires = null;
    user.is_active = true;

    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      previous_status: 'unverified',
      action: `Verified email for ${user.email}`,
      user_id: user.id,
    });

    return this.usersRepository.save(user);
  }

  async validateUser(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is deactivated');
    }

    if (user.entity_type === EntityTypes.SUPPLIER && user.is_restricted) {
      throw new UnauthorizedException(
        'Supplier account is restricted due to no company association. Please contact support.',
      );
    }

    return user;
  }

  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      return;
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.password_reset_token = hashedToken;
    user.password_reset_expires = resetExpires;
    await this.usersRepository.save(user);

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    // await this.emailService.sendEmail({
    //   to: user.email,
    //   subject: 'Password Reset Request',
    //   template: 'password-reset',
    //   context: {
    //     name: user.first_name,
    //     resetUrl,
    //     expiresIn: '1 hour',
    //   },
    // });

    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      action: `Requested password reset for ${user.email}`,
      user_id: user.id,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        password_reset_expires: MoreThanOrEqual(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const isValidToken = await bcrypt.compare(token, user.password_reset_token);
    if (!isValidToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password_reset_token = null;
    user.password_reset_expires = null;

    await this.usersRepository.save(user);
    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      action: `Reset password for ${user.email}`,
      user_id: user.id,
    });
  }

  async findUsersByCompanyId(companyId: number): Promise<User[]> {
    try {
      const users = await this.usersRepository.find({
        where: {
          company: { id: companyId },
          is_active: true,
        },
        relations: ['company'],
      });

      if (!users.length) {
        return [];
      }

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users for company ${companyId}: ${error.message}`,
      );
    }
  }

  async getUserOnlineStatus(userId: number): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['status'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user?.status || 'offline';
  }

  async getUsersOnlineStatus(
    userIds: number[],
  ): Promise<{ [key: number]: string }> {
    const users = await this.usersRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'status'],
    });

    return users.reduce((acc, user) => {
      acc[user.id] = user.status;
      return acc;
    }, {});
  }

  async updateAvatar(
    file: Express.Multer.File,
    currentUser: User,
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersRepository.findOne({
        where: { id: currentUser.id },
        relations: ['avatar'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${currentUser.id} not found`);
      }

      const oldAvatarId = user.avatar?.id;

      const avatar = await this.documentService.uploadDocument(
        file,
        currentUser.id,
        DocumentType.AVATAR,
      );

      user.avatar = avatar;
      await queryRunner.manager.save(user);

      if (oldAvatarId) {
        await this.documentService.deleteDocument(oldAvatarId, currentUser.id);
      }

      await this.logsService.createLog({
        action_type: LogsType.PROFILE,
        action: `Updated avatar for user ${currentUser.id}`,
        user_id: currentUser.id,
      });

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAvatar(currentUser: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersRepository.findOne({
        where: { id: currentUser.id },
        relations: ['avatar'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${currentUser.id} not found`);
      }

      if (!user.avatar) {
        throw new NotFoundException('User does not have an avatar');
      }

      const avatarId = user.avatar.id;

      user.avatar = null;
      await queryRunner.manager.save(user);

      await this.documentService.deleteDocument(avatarId, currentUser.id);

      // Log the action
      await this.logsService.createLog({
        action_type: LogsType.PROFILE,
        action: `Deleted avatar for user ${currentUser.id}`,
        user_id: currentUser.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
