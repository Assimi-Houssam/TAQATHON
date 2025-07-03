import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntityTypes } from '../enums/user.enum';

@Injectable()
export class SupplierRestrictionService {
  private readonly SUPPLIER_GRACE_PERIOD_DAYS = 20;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAndRestrictSuppliers() {
    try {
      const gracePeriodDate = new Date();
      gracePeriodDate.setDate(
        gracePeriodDate.getDate() - this.SUPPLIER_GRACE_PERIOD_DAYS,
      );

      const suppliersToRestrict = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.company', 'company')
        .where('user.entity_type = :entityType', {
          entityType: EntityTypes.SUPPLIER,
        })
        .andWhere('user.created_at <= :gracePeriodDate', {
          gracePeriodDate,
        })
        .andWhere('company.id IS NULL')
        .andWhere('user.is_restricted = :isRestricted', { isRestricted: false })
        .getMany();

      if (suppliersToRestrict.length > 0) {
        const updatePromises = suppliersToRestrict.map(async (supplier) => {
          supplier.is_restricted = true;
          supplier.restriction_date = new Date();

          return supplier;
        });

        const updatedSuppliers = await Promise.all(updatePromises);
        await this.userRepository.save(updatedSuppliers);
      }
    } catch (error) {
      throw error;
    }
  }

  async getRestrictedSuppliers() {
    return this.userRepository.find({
      where: {
        entity_type: EntityTypes.SUPPLIER,
        is_restricted: true,
      },
      relations: ['company'],
    });
  }
}
