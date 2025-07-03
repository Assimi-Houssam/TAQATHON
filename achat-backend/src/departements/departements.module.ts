import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartementsController } from './departements.controller';
import { DepartementsService } from './departements.service';
import { Departement } from './entities/departement.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Departement]), // Register the Departement entity
  ],
  controllers: [DepartementsController],
  providers: [DepartementsService],
  exports: [DepartementsService] // Export service if needed by other modules
})
export class DepartementsModule {}