import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departement } from './entities/departement.entity';
import {
  CreateDepartementDto,
  UpdateDepartementDto,
} from './dto/Departements.dto';
@Injectable()
export class DepartementsService {
  constructor(
    @InjectRepository(Departement)
    private departementsRepository: Repository<Departement>,
  ) {}

  async findAll(): Promise<Departement[]> {
    return await this.departementsRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: number): Promise<Departement> {
    const departement = await this.departementsRepository.findOne({
      where: { id },
    });
    if (!departement) {
      throw new NotFoundException(`Departement with ID ${id} not found`);
    }
    return departement;
  }

  async create(createDepartementDto: CreateDepartementDto) {
    const departement =
      this.departementsRepository.create(createDepartementDto);
    await this.departementsRepository.save(departement);
  }

  async update(id: number, updateDepartementDto: UpdateDepartementDto) {
    const departement = await this.findOne(id);
    Object.assign(departement, updateDepartementDto);
    return await this.departementsRepository.save(departement);
  }

  async remove(id: number): Promise<void> {
    const result = await this.departementsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Departement with ID ${id} not found`);
    }
  }

  // Optional: Add custom query methods
  async findByName(name: string): Promise<Departement[]> {
    return await this.departementsRepository.find({
      where: { name },
    });
  }
}
