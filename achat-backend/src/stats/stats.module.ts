import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Departement } from 'src/departements/entities/departement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Departement])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
