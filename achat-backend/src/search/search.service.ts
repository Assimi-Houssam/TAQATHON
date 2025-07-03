import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { PurchaseRequest } from '../purchase-requests/entities/purchase-request.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { Report } from 'src/reports/entities/report.entity';
import { SearchResult, SearchOptions } from './types/search-type';
import {
  PRVisibilityType,
  PurchaseRequestStatus,
} from '../purchase-requests/enums/purchase-request.enum';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async search(
    options: SearchOptions,
    userId: number,
  ): Promise<{ results: SearchResult[]; total: number }> {
    const { query, page = 1, limit = 10 } = options;
    const searchPattern = ILike(`%${query}%`);

    const currentUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    const searchPromises: Promise<SearchResult[]>[] = [];

    searchPromises.push(
      this.userRepository
        .find({
          where: [
            { first_name: searchPattern },
            { last_name: searchPattern },
            { email: searchPattern },
          ],
        })
        .then((users) =>
          users.map((user) => ({
            id: user.id.toString(),
            title: `${user.first_name} ${user.last_name}`,
            description: user.email,
            type: 'user' as const,
          })),
        ),
    );

    searchPromises.push(
      this.companyRepository
        .find({
          where: [
            { legal_name: searchPattern },
            { description: searchPattern },
          ],
        })
        .then((companies) =>
          companies.map((company) => ({
            id: company.id.toString(),
            title: company.legal_name,
            description: company.description,
            type: 'company' as const,
          })),
        ),
    );

    searchPromises.push(
      this.purchaseRequestRepository
        .createQueryBuilder('pr')
        .leftJoinAndSelect('pr.owner', 'owner')
        .leftJoinAndSelect('pr.bids', 'bids')
        .leftJoinAndSelect('bids.company', 'company')
        .where('(pr.request_code ILIKE :query)', {
          query: `%${query}%`,
        })
        .andWhere(
          '(pr.owner.id = :userId OR pr.purchase_visibility = :visibility OR pr.status = :status OR company.id = :companyId)',
          {
            userId,
            visibility: PRVisibilityType.PUBLIC,
            status: PurchaseRequestStatus.FINISHED,
            companyId: currentUser.company?.id,
          },
        )
        .getMany()
        .then((requests) =>
          requests.map((request) => ({
            id: request.id.toString(),
            title: request.title,
            description: request.description,
            type: 'pRequest' as const,
          })),
        )
        .catch((error) => {
          console.error('Error fetching purchase requests:', error);
          return [];
        }),
    );

    searchPromises.push(
      this.bidRepository
        .createQueryBuilder('bid')
        .leftJoinAndSelect('bid.company', 'company')
        .where('(bid.bid_reference ILIKE :query)', { query: `%${query}%` })
        .andWhere('company.id = :companyId', {
          companyId: currentUser.company?.id,
        })
        .getMany()
        .then((bids) =>
          bids.map((bid) => ({
            id: bid.id.toString(),
            title: bid.bid_reference,
            description: bid.bid_description,
            type: 'bid' as const,
          })),
        )
        .catch((error) => {
          console.error('Error fetching bids:', error);
          return [];
        }),
    );

    searchPromises.push(
      this.reportRepository
        .createQueryBuilder('report')
        .where(
          '(report.report_reference ILIKE :query OR report.title ILIKE :query)',
          { query: `%${query}%` },
        )
        .getMany()
        .then((reports) =>
          reports.map((report) => ({
            id: report.id.toString(),
            title: report.report_reference,
            description: report.title,
            type: 'report' as const,
          })),
        )
        .catch((error) => {
          console.error('Error fetching reports:', error);
          return [];
        }),
    );

    const results = await Promise.all(searchPromises);
    const flatResults = results.flat();

    const sortedResults = flatResults.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase().includes(query.toLowerCase());
      const bExactMatch = b.title.toLowerCase().includes(query.toLowerCase());
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      return 0;
    });

    const skip = (page - 1) * limit;
    const paginatedResults = sortedResults.slice(skip, skip + limit);
    const total = sortedResults.length;

    return {
      results: paginatedResults,
      total,
    };
  }
}
