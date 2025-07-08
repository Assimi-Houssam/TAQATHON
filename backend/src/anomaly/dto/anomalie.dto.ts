import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnomalieDto {
  @ApiPropertyOptional({
    description: 'Equipment number',
    example: 'EQ-001-2024',
  })
  @IsString()
  @IsOptional()
  num_equipments?: string;

  @ApiPropertyOptional({
    description: 'Intervention duration',
    example: '2 hours',
  })
  @IsString()
  @IsOptional()
  duree_intervention?: string;

  @ApiPropertyOptional({
    description: 'Unit/Location',
    example: 'Production Unit A',
  })
  @IsString()
  @IsOptional()
  unite?: string;

  @ApiPropertyOptional({
    description: 'System name',
    example: 'Cooling System',
  })
  @IsString()
  @IsOptional()
  systeme?: string;

  @ApiPropertyOptional({
    description: 'Anomaly description',
    example: 'Equipment overheating detected',
  })
  @IsString()
  @IsOptional()
  descreption_anomalie?: string;

  @ApiPropertyOptional({
    description: 'Origin system',
    enum: ['ORACLE', 'MAXIMO', 'EMC', 'APM'],
    example: 'MAXIMO',
  })
  @IsEnum(['ORACLE', 'MAXIMO', 'EMC', 'APM'])
  @IsOptional()
  origine?: 'ORACLE' | 'MAXIMO' | 'EMC' | 'APM';

  @ApiPropertyOptional({
    description: 'Detection date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  date_detection?: string;

  @ApiPropertyOptional({
    description: 'Owner section',
    example: 'Maintenance Team A',
  })
  @IsString()
  @IsOptional()
  section_proprietaire?: string;

  @ApiPropertyOptional({
    description: 'Reliability integrity',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  fiablite_integrite?: string;

  @ApiPropertyOptional({
    description: 'Reliability confidence',
    example: 'Medium',
  })
  @IsString()
  @IsOptional()
  fiablite_conf?: string;

  @ApiPropertyOptional({
    description: 'Availability',
    example: 'Available',
  })
  @IsString()
  @IsOptional()
  disponsibilite?: string;

  @ApiPropertyOptional({
    description: 'Availability confidence',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  disponibilite_conf?: string;

  @ApiPropertyOptional({
    description: 'Process safety',
    example: 'Critical',
  })
  @IsString()
  @IsOptional()
  process_safty?: string;

  @ApiPropertyOptional({
    description: 'Process safety confidence',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  process_safty_conf?: string;

  @ApiPropertyOptional({
    description: 'Criticality level',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  criticite?: string;

  @ApiPropertyOptional({
    description: 'Anomaly status',
    enum: ['NEW', 'IN_PROGRESS', 'CLOSED'],
    example: 'NEW',
  })
  @IsEnum(['NEW', 'IN_PROGRESS', 'CLOSED'])
  @IsOptional()
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED';

  @ApiPropertyOptional({
    description: 'Source system',
    enum: ['MC', 'MM', 'MD', 'CT', 'EL'],
    example: 'MC',
  })
  @IsEnum(['MC', 'MM', 'MD', 'CT', 'EL'])
  @IsOptional()
  section?: 'MC' | 'MM' | 'MD' | 'CT' | 'EL';

  @ApiPropertyOptional({
    description: 'Additional comments',
    example: 'Requires immediate attention',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Requires stopping operations',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  required_stoping?: boolean;

  @ApiPropertyOptional({
    description: 'Resolution date',
    example: '2024-01-20T14:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @ApiPropertyOptional({
    description: 'Treatment date',
    example: '2024-01-18T09:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  date_traitement?: string;

  @ApiPropertyOptional({
    description: 'Training status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  trained?: boolean;

  @ApiPropertyOptional({
    description: 'Maintenance window ID',
    example: 'mw_clr123abc456',
  })
  @IsString()
  @IsOptional()
  maintenance_window_id?: string;
}

export class UpdateAnomalieDto {
  @ApiPropertyOptional({
    description: 'Equipment number',
    example: 'EQ-001-2024',
  })
  @IsString()
  @IsOptional()
  num_equipments?: string;

  @ApiPropertyOptional({
    description: 'Unit/Location',
    example: 'Production Unit A',
  })
  @IsString()
  @IsOptional()
  unite?: string;

  @ApiPropertyOptional({
    description: 'System name',
    example: 'Cooling System',
  })
  @IsString()
  @IsOptional()
  systeme?: string;

  @ApiPropertyOptional({
    description: 'Anomaly description',
    example: 'Equipment overheating detected',
  })
  @IsString()
  @IsOptional()
  descreption_anomalie?: string;

  @ApiPropertyOptional({
    description: 'Origin system',
    enum: ['ORACLE', 'MAXIMO', 'EMC', 'APM'],
    example: 'MAXIMO',
  })
  @IsEnum(['ORACLE', 'MAXIMO', 'EMC', 'APM'])
  @IsOptional()
  origine?: 'ORACLE' | 'MAXIMO' | 'EMC' | 'APM';

  @ApiPropertyOptional({
    description: 'Detection date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  date_detection?: string;

  @ApiPropertyOptional({
    description: 'Owner section',
    example: 'Maintenance Team A',
  })
  @IsString()
  @IsOptional()
  section_proprietaire?: string;

  @ApiPropertyOptional({
    description: 'Reliability integrity',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  fiablite_integrite?: string;

  @ApiPropertyOptional({
    description: 'Reliability confidence',
    example: 'Medium',
  })
  @IsString()
  @IsOptional()
  fiablite_conf?: string;

  @ApiPropertyOptional({ description: 'Availability', example: 'Available' })
  @IsString()
  @IsOptional()
  disponsibilite?: string;

  @ApiPropertyOptional({
    description: 'Availability confidence',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  disponibilite_conf?: string;

  @ApiPropertyOptional({ description: 'Process safety', example: 'Critical' })
  @IsString()
  @IsOptional()
  process_safty?: string;

  @ApiPropertyOptional({
    description: 'Process safety confidence',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  process_safty_conf?: string;

  @ApiPropertyOptional({ description: 'Criticality level', example: 'High' })
  @IsString()
  @IsOptional()
  criticite?: string;

  @ApiPropertyOptional({
    description: 'Anomaly status',
    enum: ['NEW', 'IN_PROGRESS', 'CLOSED'],
    example: 'NEW',
  })
  @IsEnum(['NEW', 'IN_PROGRESS', 'CLOSED'])
  @IsOptional()
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED';

  @ApiPropertyOptional({
    description: 'Additional comments',
    example: 'Requires immediate attention',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Requires stopping operations',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  required_stoping?: boolean;

  @ApiPropertyOptional({
    description: 'Intervention duration',
    example: '2 hours',
  })
  @IsString()
  @IsOptional()
  duree_intervention?: string;

  @ApiPropertyOptional({
    description: 'Source system',
    enum: ['MC', 'MM', 'MD', 'CT', 'EL'],
    example: 'MC',
  })
  @IsEnum(['MC', 'MM', 'MD', 'CT', 'EL'])
  @IsOptional()
  section?: 'MC' | 'MM' | 'MD' | 'CT' | 'EL';

  @ApiPropertyOptional({
    description: 'Resolution date',
    example: '2024-01-20T14:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @ApiPropertyOptional({
    description: 'Treatment date',
    example: '2024-01-18T09:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  date_traitement?: string;

  @ApiPropertyOptional({ description: 'Training status', example: false })
  @IsBoolean()
  @IsOptional()
  trained?: boolean;

  @ApiPropertyOptional({
    description: 'Maintenance window ID',
    example: 'mw_clr123abc456',
  })
  @IsString()
  @IsOptional()
  maintenance_window_id?: string;
}
