import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/companies/entities/company.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { PurchaseRequestStatus } from 'src/purchase-requests/enums/purchase-request.enum';
import { User } from 'src/users/entities/user.entity';
import { EntityTypes } from 'src/users/enums/user.enum';
import { In, Repository } from 'typeorm';
import { Departement } from 'src/departements/entities/departement.entity';
import { Between } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PurchaseRequest)
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Departement)
    private departementRepository: Repository<Departement>,
  ) {}

  async getStats(): Promise<{
    suppliers: {
      companies: number;
      operators: number;
    };
    purchaseRequests: {
      total: number;
      finished: number;
      published: number;
      rejected: number;
    };
    agents: number;
  }> {
    const [
      operatorCount,
      companyCount,
      agentCount,
      totalPurchaseRequestCount,
      finishedRequestCount,
      publishedRequestCount,
      scheduledRequestCount,
      rejectedRequestCount,
    ] = await Promise.all([
      this.userRepository.count({
        where: { entity_type: EntityTypes.SUPPLIER },
      }),
      this.companyRepository.count(),
      this.userRepository.count({
        where: { entity_type: EntityTypes.OCP_AGENT },
      }),
      this.purchaseRequestRepository.count(),
      this.purchaseRequestRepository.count({
        where: { status: PurchaseRequestStatus.FINISHED },
      }),
      this.purchaseRequestRepository.count({
        where: { status: PurchaseRequestStatus.PUBLISHED },
      }),
      this.purchaseRequestRepository.count({
        where: { status: PurchaseRequestStatus.SCHEDULED },
      }),
      this.purchaseRequestRepository.count({
        where: { status: PurchaseRequestStatus.REJECTED },
      }),
    ]);

    return {
      suppliers: {
        companies: companyCount,
        operators: operatorCount,
      },
      purchaseRequests: {
        total: totalPurchaseRequestCount,
        finished: finishedRequestCount,
        published: publishedRequestCount + scheduledRequestCount,
        rejected: rejectedRequestCount,
      },
      agents: agentCount,
    };
  }

  async getDepartmentsStat(year: number): Promise<
    {
      id: number;
      name: string;
      code: string;
      requestCount: number;
      year: number;
    }[]
  > {
    // Get start and end dates for the specified year
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year, 11, 31); // December 31st of the year

    // Get all departments first
    const departments = await this.departementRepository.find({
      where: { isActive: true },
      select: ['id', 'name', 'code'],
    });

    // Get purchase request counts for each department
    const stats = await Promise.all(
      departments.map(async (dept) => {
        const requestCount = await this.purchaseRequestRepository.count({
          where: {
            buying_department: { id: dept.id },
            created_at: Between(startDate, endDate),
          },
        });

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          requestCount,
        };
      }),
    );

    return stats
      .map((stat) => ({
        ...stat,
        year,
      }))
      .sort((a, b) => b.requestCount - a.requestCount);
  }

  async getCompaniesStat(
    year?: number,
    business_scope?: number,
    page?: number,
    limit?: number,
  ): Promise<{
    companies: {
      id: number;
      name: string;
      requestCount: number;
      wonRequestCount: number;
      business_scopes: {
        id: number;
        name: string;
      }[];
    }[];
    total: number;
  }> {
    // Get companies query
    const companiesQuery = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.business_scopes', 'business_scopes')
      .select([
        'company.id',
        'company.name',
        'business_scopes.id',
        'business_scopes.name',
      ]);

    if (business_scope) {
      companiesQuery.andWhere('business_scopes.id = :businessScopeId', {
        businessScopeId: business_scope,
      });
    }

    if (page && limit) {
      companiesQuery.skip((page - 1) * limit).take(limit);
    }

    const [companies, total] = await companiesQuery.getManyAndCount();

    // Get statistics for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        let requestCountQuery = this.purchaseRequestRepository
          .createQueryBuilder('pr')
          .leftJoin('pr.bids', 'bids')
          .where('bids.company_id = :companyId', { companyId: company.id });

        let wonRequestCountQuery = this.purchaseRequestRepository
          .createQueryBuilder('pr')
          .leftJoin('pr.winning_bid', 'winning_bid')
          .where('winning_bid.company_id = :companyId', {
            companyId: company.id,
          });

        if (year) {
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31);
          requestCountQuery.andWhere(
            'pr.created_at BETWEEN :startDate AND :endDate',
            { startDate, endDate },
          );
          wonRequestCountQuery.andWhere(
            'pr.created_at BETWEEN :startDate AND :endDate',
            { startDate, endDate },
          );
        }

        const [requestCount, wonRequestCount] = await Promise.all([
          requestCountQuery.getCount(),
          wonRequestCountQuery.getCount(),
        ]);

        return {
          id: company.id,
          companyName: company.legal_name,
          requestCount,
          wonRequestCount,
          business_scopes: company.business_scopes.map((scope) => ({
            id: scope.id,
            name: scope.name,
          })),
        };
      }),
    );

    // Sort companies by won requests in descending order
    const sortedCompanies = companiesWithStats.sort(
      (a, b) => b.wonRequestCount - a.wonRequestCount,
    );
    return {
      companies: sortedCompanies.map((company) => ({
        id: company.id,
        name: company.companyName,
        requestCount: company.requestCount,
        wonRequestCount: company.wonRequestCount,
        business_scopes: company.business_scopes,
      })),
      total: total,
    };
  }
}
