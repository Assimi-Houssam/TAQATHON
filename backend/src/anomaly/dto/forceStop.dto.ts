import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ForceStopDto {
  @ApiPropertyOptional({
    description: 'Start date of maintenance stop',
    example: '2024-01-15T08:00:00Z',
  })
  @IsString()
  @IsOptional()
  date_debut_arret: string;

  @ApiPropertyOptional({
    description: 'End date of maintenance stop',
    example: '2024-01-15T18:00:00Z',
  })
  @IsString()
  @IsOptional()
  date_fin_arret: string;

  @ApiPropertyOptional({
    description: 'Maintenance window title',
    example: 'Planned Maintenance Window',
  })
  @IsString()
  @IsOptional()
  titlte: string;

  @ApiPropertyOptional({
    description: 'Duration in days',
    example: '1',
  })
  @IsString()
  @IsOptional()
  duree_jour: string;

  @ApiPropertyOptional({
    description: 'Duration in hours',
    example: '8',
  })
  @IsString()
  @IsOptional()
  duree_heure: string;
}
