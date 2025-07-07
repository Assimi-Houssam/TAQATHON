import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';


export class CreateActionPlanDto {
  @IsString()
  @IsOptional()
  Action?: string;

  @IsString()
  @IsOptional()
  responsable?: string;

  @IsBoolean()
  @IsOptional()
  pdrs_disponible?: boolean;

  @IsString()
  @IsOptional()
  resource_intern?: string;

  @IsString()
  @IsOptional()
  resource_extern?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  anomaly_id: string; // Required when creating action plan
}

export class UpdateActionPlanDto {
  @IsString()
  @IsOptional()
  Action?: string;

  @IsString()
  @IsOptional()
  responsable?: string;

  @IsBoolean()
  @IsOptional()
  pdrs_disponible?: boolean;

  @IsString()
  @IsOptional()
  resource_intern?: string;

  @IsString()
  @IsOptional()
  resource_extern?: string;

  @IsEnum(['NOT_STARTED', 'COMPLETED', 'BLOCKED', 'CANCELLED', 'ON_HOLD', 'IN_PROGRESS'])
  @IsOptional()
  status?: 'NOT_STARTED' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED' | 'ON_HOLD' | 'IN_PROGRESS';

}

// DTO for response (includes id and relations)
export class ActionPlanResponseDto {
  id: string;
  Action?: string;
  responsable?: string;
  pdrs_disponible?: boolean;
  resource_intern?: string;
  resource_extern?: string;
  status?: string;
  anomaly_id?: string;
  anomaly?: {
    id: string;
    num_equipments?: string;
    descreption_anomalie?: string;
    status?: string;
  };
}

// DTO for creating multiple action plans at once
export class CreateMultipleActionPlansDto {
  @IsString()
  @IsNotEmpty()
  anomaly_id: string;

  action_plans: Omit<CreateActionPlanDto, 'anomaly_id'>[];
}