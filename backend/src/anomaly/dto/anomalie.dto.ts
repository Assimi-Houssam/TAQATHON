import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateAnomalieDto {
  @IsString()
  @IsOptional()
  num_equipments?: string;

  @IsString()
  @IsOptional()
  duree_intervention?: string;

  @IsString()
  @IsOptional()
  unite?: string;

  @IsString()
  @IsOptional()
  systeme?: string;

  @IsString()
  @IsOptional()
  descreption_anomalie?: string;

  @IsEnum(['ORACLE', 'MAXIMO', 'EMC', 'APM'])
  @IsOptional()
  origine?: 'ORACLE' | 'MAXIMO' | 'EMC' | 'APM';

  @IsDateString()
  @IsOptional()
  date_detection?: string;

  @IsString()
  @IsOptional()
  section_proprietaire?: string;

  @IsString()
  @IsOptional()
  fiablite_integrite?: string;

  @IsString()
  @IsOptional()
  fiablite_conf?: string;

  @IsString()
  @IsOptional()
  disponsibilite?: string;

  @IsString()
  @IsOptional()
  disponibilite_conf?: string;

  @IsString()
  @IsOptional()
  process_safty?: string;

  @IsString()
  @IsOptional()
  process_safty_conf?: string;

  @IsString()
  @IsOptional()
  Criticite?: string;

  @IsEnum(['NEW', 'IN_PROGRESS', 'CLOSED'])
  @IsOptional()
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED';

  @IsEnum(['MC', 'MM', 'MD', 'CT', 'EL'])
  @IsOptional()
  source?: 'MC' | 'MM' | 'MD' | 'CT' | 'EL';

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  required_stoping?: boolean;

  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @IsDateString()
  @IsOptional()
  date_traitement?: string;

  @IsBoolean()
  @IsOptional()
  trained?: boolean;

  @IsString()
  @IsOptional()
  maintenance_window_id?: string;
}

export class UpdateAnomalieDto {
  @IsString()
  @IsOptional()
  num_equipments?: string;

  @IsString()
  @IsOptional()
  unite?: string;

  @IsString()
  @IsOptional()
  systeme?: string;

  @IsString()
  @IsOptional()
  descreption_anomalie?: string;

  @IsEnum(['ORACLE', 'MAXIMO', 'EMC', 'APM'])
  @IsOptional()
  origine?: 'ORACLE' | 'MAXIMO' | 'EMC' | 'APM';

  @IsDateString()
  @IsOptional()
  date_detection?: string;

  @IsString()
  @IsOptional()
  section_proprietaire?: string;

  @IsString()
  @IsOptional()
  fiablite_integrite?: string;

  @IsString()
  @IsOptional()
  fiablite_conf?: string;

  @IsString()
  @IsOptional()
  disponsibilite?: string;

  @IsString()
  @IsOptional()
  disponibilite_conf?: string;

  @IsString()
  @IsOptional()
  process_safty?: string;

  @IsString()
  @IsOptional()
  process_safty_conf?: string;

  @IsString()
  @IsOptional()
  Criticite?: string;

  @IsEnum(['NEW', 'IN_PROGRESS', 'CLOSED'])
  @IsOptional()
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED';

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  required_stoping?: boolean;

  @IsString()
  @IsOptional()
  duree_intervention?: string;

  @IsEnum(['MC', 'MM', 'MD', 'CT', 'EL'])
  @IsOptional()
  source?: 'MC' | 'MM' | 'MD' | 'CT' | 'EL';

  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @IsDateString()
  @IsOptional()
  date_traitement?: string;

  @IsBoolean()
  @IsOptional()
  trained?: boolean;

  @IsString()
  @IsOptional()
  maintenance_window_id?: string;
}
