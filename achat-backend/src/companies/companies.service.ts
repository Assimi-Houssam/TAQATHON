import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentService } from 'src/documents/doc.service';
import { Document } from 'src/documents/entities/doc.entity';
import { Answer } from 'src/forms/entities/answer.entity';
import { FormsService } from 'src/forms/forms.service';
import { LogsType } from 'src/logs/enums/logs.enum';
import { LogsService } from 'src/logs/logs.service';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import {
  AddNewBusinessScopeDto,
  AssignBusinessScopeToCompanyDto,
  UpdateBusinessScopeDto,
} from './dto/business-scope.dto';
import {
  CreateCompanyDto,
  GetCompaniesDto,
  ToggleLockCompanyDto,
  VerifyCompanyDto,
} from './dto/companies.dto';
import { BusinessScope } from './entities/business-scope.entity';
import { Company } from './entities/company.entity';
import {
  CompanyApprovalStatus,
  CompanyLockActionDto,
  CompanyStatus,
} from './enums/company.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private readonly dataSource: DataSource,
    private readonly logsService: LogsService,
    @InjectRepository(BusinessScope)
    private businessScopesRepository: Repository<BusinessScope>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private documentService: DocumentService,
    private formsService: FormsService,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate owner
      const owner = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['company'],
      });

      if (!owner) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (owner.company) {
        throw new ConflictException(`User already belongs to a company`);
      }

      // Validate all required documents
      const documentPromises = {
        companyStatutes: Promise.all(
          createCompanyDto.documents.companyStatutes.map((id) =>
            this.documentsRepository.findOne({ where: { id } }),
          ),
        ),
        termsOfUseAndAccess: Promise.all(
          createCompanyDto.documents.termsOfUseAndAccess.map((id) =>
            this.documentsRepository.findOne({ where: { id } }),
          ),
        ),
        commercialRegistry: Promise.all(
          createCompanyDto.documents.commercialRegistry.map((id) =>
            this.documentsRepository.findOne({ where: { id } }),
          ),
        ),
        financialStatements: Promise.all(
          createCompanyDto.documents.financialStatements.map((id) =>
            this.documentsRepository.findOne({ where: { id } }),
          ),
        ),
        clientReferences: createCompanyDto.documents.clientReferences
          ? Promise.all(
              createCompanyDto.documents.clientReferences.map((id) =>
                this.documentsRepository.findOne({ where: { id } }),
              ),
            )
          : Promise.resolve([]),
      };

      const documents = await Promise.all(Object.values(documentPromises));

      // Validate all documents exist
      const allDocuments = documents.flat();
      if (allDocuments.some((doc) => !doc)) {
        throw new NotFoundException('One or more documents not found');
      }

      // Create and save company
      const company = this.companiesRepository.create({
        legal_name: createCompanyDto.basicInfo.legalName,
        commercial_name: createCompanyDto.basicInfo.commercialName,
        legal_form: createCompanyDto.basicInfo.legalForm,
        ICE: createCompanyDto.basicInfo.ICE,
        SIRET_number: createCompanyDto.basicInfo.siretNumber,
        VAT_number: createCompanyDto.basicInfo.vatNumber,
        // primary_contact: createCompanyDto.contact.primaryContact,
        email: createCompanyDto.contact.email,
        company_phone: createCompanyDto.contact.primaryPhone,
        company_2nd_phone: createCompanyDto.contact.secondaryPhone,
        address: createCompanyDto.address.registeredOffice,
        // headquarters: createCompanyDto.address.headquarters,
        // branch_locations: createCompanyDto.address.branchLocations,
        // business_scopes: createCompanyDto.legal.businessActivities,
        industry_code: createCompanyDto.legal.industryCode,
        certifications: createCompanyDto.legal.certifications,
        // other_certifications: createCompanyDto.legal.otherCertifications,
        // documents: allDocuments,
        owner,
        members: [owner],
        active_status: CompanyStatus.ACTIVE,
        approval_status: CompanyApprovalStatus.WAITING_APPROVAL,
      });
      company.country = owner.country;
      const savedCompany = await queryRunner.manager.save(company);
      // Save the answers to the additional questions
      const additionalQuestions = createCompanyDto.additional;
      const validAnswers =
        await this.formsService.validateAnswers(additionalQuestions);
      if (!validAnswers) {
        throw new BadRequestException('Invalid answers');
      }
      const answers = additionalQuestions.map((question) =>
        queryRunner.manager.save(Answer, {
          formfield: { id: question.formfieldId },
          content: question.content,
          company: { id: savedCompany.id },
        }),
      );
      await Promise.all(answers);
      // Update owner's company reference
      owner.company = savedCompany;
      await queryRunner.manager.save(owner);

      // Create log entry
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `Company ${savedCompany.legal_name} created by user ${owner.email}`,
        user_id: userId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error(error);
      throw new InternalServerErrorException(
        `Failed to create company: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findCompany(id: number): Promise<Company> {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async findAll({
    page,
    limit,
    search,
    city,
    phone,
    business_scope_ids,
    status,
    approval_status,
  }: GetCompaniesDto): Promise<{
    companies: Company[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.business_scopes', 'business_scope');

    if (search) {
      query.andWhere(
        '(LOWER(company.commercial_name) LIKE LOWER(:search) OR LOWER(company.legal_name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (city) {
      query.andWhere('LOWER(company.city) LIKE LOWER(:city)', {
        city: `%${city}%`,
      });
    }

    if (phone) {
      query.andWhere('company.company_phone LIKE :phone', {
        phone: `%${phone}%`,
      });
    }

    if (business_scope_ids && business_scope_ids.length > 0) {
      query
        .innerJoin('company.business_scopes', 'bs')
        .andWhere('bs.id IN (:...business_scope_ids)', { business_scope_ids });
    }

    if (status) {
      query.andWhere('company.status = :status', { status });
    }

    if (approval_status && approval_status.length > 0) {
      query.andWhere('company.approval_status IN (:...approval_status)', {
        approval_status,
      });
    }

    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([
      query.skip(skip).take(limit).getMany(),
      query.getCount(),
    ]);

    return {
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async inviteUser(email: string, currentUser: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if inviter's company exists and is active
      const company = await queryRunner.manager.findOne(Company, {
        where: {
          id: currentUser.company.id,
          active_status: CompanyStatus.ACTIVE,
          approval_status: CompanyApprovalStatus.APPROVED,
        },
        relations: ['members', 'owner'],
      });

      if (!company) {
        throw new NotFoundException(
          `Active and approved company with id ${currentUser.company.id} not found`,
        );
      }

      // Verify that currentUser is the owner of the company
      if (currentUser.id !== company.owner.id) {
        throw new ForbiddenException('Only company owner can invite users');
      }

      // Find the user to be invited
      const userToInvite = await queryRunner.manager.findOne(User, {
        where: { email },
        relations: ['company'],
      });

      if (!userToInvite) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      // Check if user is already in a company
      if (userToInvite.company) {
        throw new BadRequestException(
          `User ${userToInvite.email} already belongs to company ${userToInvite.company.legal_name}`,
        );
      }

      // Check if user is already a member of this company
      const isAlreadyMember = company.members.some(
        (member) => member.id === userToInvite.id,
      );
      if (isAlreadyMember) {
        throw new BadRequestException(
          `User ${userToInvite.email} is already a member of this company`,
        );
      }

      // Add user to company members
      company.pending_users = [...company.pending_users, userToInvite];
      // Save changes
      const updatedCompany = await queryRunner.manager.save(Company, company);

      // Log the invitation
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `User ${userToInvite.email} was invited and added to company ${company.legal_name} by ${currentUser.email}`,
        user_id: currentUser.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to invite user: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async manageInvitation(
    companyId: number,
    currentUser: User,
    accept: boolean,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get company with relations
      const company = await queryRunner.manager.findOne(Company, {
        where: { id: companyId },
        relations: ['members', 'pending_users', 'owner'],
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      // Check if company is active and approved
      if (
        company.active_status !== CompanyStatus.ACTIVE ||
        company.approval_status !== CompanyApprovalStatus.APPROVED
      ) {
        throw new BadRequestException(
          'Cannot manage invitations for inactive or unapproved company',
        );
      }

      // Get user with company relation to check current affiliations
      const user = await queryRunner.manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['company'],
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      // Verify user is in pending list
      const isPending = company.pending_users.some(
        (pendingUser) => pendingUser.id === currentUser.id,
      );
      if (!isPending) {
        throw new BadRequestException(
          `You don't have a pending invitation from this company`,
        );
      }

      // Check if user already belongs to another company
      if (user.company) {
        throw new ConflictException(
          `You already belong to company ${user.company.legal_name}`,
        );
      }

      if (accept) {
        // Accept invitation
        company.members = [...company.members, user];
        company.pending_users = company.pending_users.filter(
          (pendingUser) => pendingUser.id !== currentUser.id,
        );
        user.company = company;

        // Save changes within transaction
        await queryRunner.manager.save(User, user);
        await queryRunner.manager.save(Company, company);

        // Log acceptance
        await this.logsService.createLog({
          action_type: LogsType.COMPANY,
          action: `User ${currentUser.email} accepted invitation to company ${company.legal_name}`,
          user_id: currentUser.id,
        });

        await queryRunner.commitTransaction();
      } else {
        // Reject invitation
        company.pending_users = company.pending_users.filter(
          (pendingUser) => pendingUser.id !== currentUser.id,
        );

        await queryRunner.manager.save(Company, company);

        // Log rejection
        await this.logsService.createLog({
          action_type: LogsType.COMPANY,
          action: `User ${currentUser.email} rejected invitation to company ${company.legal_name}`,
          user_id: currentUser.id,
        });

        await queryRunner.commitTransaction();
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to ${accept ? 'accept' : 'reject'} invitation: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async removeUser(companyId: number, userId: number, currentUser: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get company with relations
      const company = await queryRunner.manager.findOne(Company, {
        where: { id: companyId },
        relations: ['members', 'owner'],
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      // Check if current user has permission (must be company owner)
      if (company.owner.id !== currentUser.id) {
        throw new ForbiddenException(
          'Only company owner can remove members from company',
        );
      }

      // Get user to be removed
      const userToRemove = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['company'],
      });

      if (!userToRemove) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if user is actually a member of this company
      const isMember = company.members.some((member) => member.id === userId);
      if (!isMember) {
        throw new BadRequestException(
          `User ${userToRemove.email} is not a member of this company`,
        );
      }

      // Cannot remove company owner
      if (userId === company.owner.id) {
        throw new ForbiddenException(
          'Cannot remove company owner from company',
        );
      }

      // Remove user from company members
      company.members = company.members.filter(
        (member) => member.id !== userId,
      );
      userToRemove.company = null;

      // Save changes within transaction
      await queryRunner.manager.save(User, userToRemove);
      await queryRunner.manager.save(Company, company);

      // Log the action
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `User ${userToRemove.email} was removed from company ${company.legal_name} by ${currentUser.email}`,
        user_id: currentUser.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to remove user from company: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async leaveCompany(companyId: number, currentUser: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get company with relations
      const company = await queryRunner.manager.findOne(Company, {
        where: { id: companyId },
        relations: ['members', 'owner', 'pending_users'],
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      // Check if company is active and approved
      if (
        company.active_status !== CompanyStatus.ACTIVE ||
        company.approval_status !== CompanyApprovalStatus.APPROVED
      ) {
        throw new BadRequestException(
          'Cannot leave inactive or unapproved company',
        );
      }

      // Cannot leave if owner
      if (company.owner.id === currentUser.id) {
        throw new ForbiddenException(
          'Company owner cannot leave company. Transfer ownership first or delete the company.',
        );
      }

      // Get user with company relation
      const user = await queryRunner.manager.findOne(User, {
        where: { id: currentUser.id },
        relations: ['company'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${currentUser.id} not found`);
      }

      // Verify user belongs to this company
      if (!user.company || user.company.id !== companyId) {
        throw new BadRequestException(
          `User ${currentUser.email} is not a member of company ${company.legal_name}`,
        );
      }

      // Check if user has any pending actions or responsibilities
      const hasPendingActions = await this.checkUserPendingActions(user.id);
      if (hasPendingActions) {
        throw new BadRequestException(
          'Cannot leave company while having pending actions or responsibilities',
        );
      }

      // Remove user from company
      user.company = null;
      company.members = company.members.filter(
        (member) => member.id !== currentUser.id,
      );

      // Also remove from pending users if present
      company.pending_users = company.pending_users.filter(
        (pendingUser) => pendingUser.id !== currentUser.id,
      );

      // Save changes within transaction
      await queryRunner.manager.save(User, user);
      await queryRunner.manager.save(Company, company);

      // Log the action
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `User ${currentUser.email} left company ${company.legal_name}`,
        user_id: currentUser.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to leave company: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Helper method to check if user has pending actions
  private async checkUserPendingActions(userId: number): Promise<boolean> {
    // Add logic to check for pending purchase requests, active bids, etc.
    // This is a placeholder - implement according to your business rules
    const pendingRequests = await this.dataSource
      .getRepository(PurchaseRequest)
      .createQueryBuilder('pr')
      .where('pr.created_by = :userId', { userId })
      .andWhere('pr.status IN (:...statuses)', {
        statuses: ['PENDING', 'IN_PROGRESS'],
      })
      .getCount();

    return pendingRequests > 0;
  }

  async toggleLockCompany(
    companyId: number,
    toggleLockDto: ToggleLockCompanyDto,
    currentUser: User,
  ) {
    try {
      const company = await this.companiesRepository.findOne({
        where: {
          id: companyId,
          active_status: CompanyStatus.ACTIVE,
          approval_status: CompanyApprovalStatus.APPROVED,
        },
        relations: ['locked_by'],
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${companyId} not found or not active`,
        );
      }

      const { action, reason } = toggleLockDto;

      if (
        action === CompanyLockActionDto.LOCK &&
        company.active_status === CompanyStatus.LOCKED
      ) {
        throw new BadRequestException('Company is already locked');
      }
      if (
        action === CompanyLockActionDto.UNLOCK &&
        company.active_status !== CompanyStatus.LOCKED
      ) {
        throw new BadRequestException('Company is not locked');
      }

      if (action === CompanyLockActionDto.LOCK) {
        company.active_status = CompanyStatus.LOCKED;
        company.lock_reason = reason;
        company.locked_by = currentUser;
      } else {
        company.active_status = CompanyStatus.ACTIVE;
        company.lock_reason = null;
        company.locked_by = null;
      }

      await this.companiesRepository.save(company);

      // Log the action
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action:
          action === CompanyLockActionDto.LOCK
            ? `Company ${company.legal_name} locked by ${currentUser.email}. Reason: ${reason}`
            : `Company ${company.legal_name} unlocked by ${currentUser.email}`,
        user_id: currentUser.id,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to ${toggleLockDto.action.toLowerCase()} company: ${error.message}`,
      );
    }
  }

  async verifyCompany(
    companyId: number,
    verifyCompanyDto: VerifyCompanyDto,
    currentUser: User,
  ) {
    try {
      const company = await this.companiesRepository.findOne({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      const { approvalStatus, rejectionReason } = verifyCompanyDto;

      if (approvalStatus === 'APPROVED') {
        company.approval_status = CompanyApprovalStatus.APPROVED;
        company.rejection_reason = null;
      } else if (approvalStatus === 'REJECTED') {
        if (!rejectionReason) {
          throw new BadRequestException(
            'Rejection reason is required when rejecting a company',
          );
        }
        company.approval_status = CompanyApprovalStatus.REJECTED;
        company.rejection_reason = rejectionReason;
      }

      await this.companiesRepository.save(company);

      // Log the verification action
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `Company ${company.legal_name} ${approvalStatus.toLowerCase()} by ${currentUser.email}${
          rejectionReason ? `. Reason: ${rejectionReason}` : ''
        }`,
        user_id: currentUser.id,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to verify company: ${error.message}`,
      );
    }
  }

  async getUserCompanies(userId: number): Promise<Company> {
    const company = await this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.members', 'members')
      .leftJoinAndSelect('company.owner', 'owner')
      .where('(members.id = :userId OR owner.id = :userId)', { userId })
      .andWhere('company.active_status = :activeStatus', {
        activeStatus: CompanyStatus.ACTIVE,
      })
      .getOne();

    return company;
  }

  async getCompanyMembers(companyId: number) {
    try {
      await this.findCompany(companyId);
      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user.company', 'company')
        .where('company.id = :companyId', { companyId })
        .select([
          'user.id',
          'user.first_name',
          'user.last_name',
          'user.email',
          'user.phone_number',
          'user.username',
        ]);

      const members = await queryBuilder.getMany();
      return members;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get company members: ${error.message}`,
      );
    }
  }

  // ----------------------------- Business Scope -----------------------------

  async getBusinessScopes() {
    return await this.businessScopesRepository.find({
      where: { isActive: true },
    });
  }

  async addNewBusinessScope(businessScope: AddNewBusinessScopeDto) {
    await this.businessScopesRepository.save(businessScope);
  }

  async assignBusinessScopeToCompany(
    id: number,
    assignBusinessScopeDto: AssignBusinessScopeToCompanyDto,
  ) {
    const company = await this.findCompany(id);
    const businessScopes = await this.businessScopesRepository.find({
      where: { id: In(assignBusinessScopeDto.business_scope_id) },
    });
    company.business_scopes = businessScopes;
    await this.companiesRepository.save(company);
  }

  async updateBusinessScope(id: number, businessScope: UpdateBusinessScopeDto) {
    await this.businessScopesRepository.update(id, businessScope);
  }

  async deleteBusinessScope(id: number) {
    await this.businessScopesRepository.delete(id);
  }

  async updateLogo(
    companyId: number,
    file: Express.Multer.File,
    currentUser: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await this.companiesRepository.findOne({
        where: {
          id: companyId,
          active_status: CompanyStatus.ACTIVE,
          approval_status: CompanyApprovalStatus.APPROVED,
        },
        relations: ['members', 'logo'],
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${companyId} not found or not active`,
        );
      }

      const members = await this.getCompanyMembers(companyId);
      // Check if user is a member of the company
      const isCompanyMember = members.some(
        (member) => member.id === currentUser.id,
      );
      if (!isCompanyMember) {
        throw new ForbiddenException(
          'You do not have permission to update company logo',
        );
      }

      // Delete old logo if exists
      if (company.logo) {
        await this.documentService.deleteDocument(
          company.logo.id,
          currentUser.id,
        );
      }

      // Upload new logo
      const logo = await this.documentService.uploadDocument(
        file,
        currentUser.id,
        'Company Logo',
      );

      // Update company with new logo
      company.logo = logo;
      await this.companiesRepository.save(company);

      // Log the action
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `Updated logo for company ${companyId}`,
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

  async deleteLogo(companyId: number, currentUser: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await this.companiesRepository.findOne({
        where: {
          id: companyId,
          active_status: CompanyStatus.ACTIVE,
          approval_status: CompanyApprovalStatus.APPROVED,
        },
        relations: ['members', 'logo'],
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${companyId} not found or not active`,
        );
      }

      // Check if user is a member of the company
      const isCompanyMember = company.members.some(
        (member) => member.id === currentUser.id,
      );
      if (!isCompanyMember) {
        throw new ForbiddenException(
          'You do not have permission to delete company logo',
        );
      }

      if (!company.logo) {
        throw new NotFoundException('Company does not have a logo');
      }

      // Delete logo document
      await this.documentService.deleteDocument(
        company.logo.id,
        currentUser.id,
      );

      // Remove logo reference from company
      company.logo = null;
      await this.companiesRepository.save(company);

      // Log the action
      await this.logsService.createLog({
        action_type: LogsType.COMPANY,
        action: `Deleted logo for company ${companyId}`,
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
