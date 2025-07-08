import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActionPlanDto {
  @ApiPropertyOptional({
    description: 'Action description',
    example: 'Replace faulty component',
  })
  @IsString()
  @IsOptional()
  Action?: string;

  @ApiPropertyOptional({
    description: 'Responsible person',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({
    description: 'PDRS available',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  pdrs_disponible?: boolean;

  @ApiPropertyOptional({
    description: 'Internal resource',
    example: 'Maintenance Team',
  })
  @IsString()
  @IsOptional()
  resource_intern?: string;

  @ApiPropertyOptional({
    description: 'External resource',
    example: 'External Contractor',
  })
  @IsString()
  @IsOptional()
  resource_extern?: string;

  @ApiPropertyOptional({
    description: 'Action status',
    example: 'IN_PROGRESS',
  })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateActionPlanDto {
  @ApiPropertyOptional({
    description: 'Action description',
    example: 'Replace faulty component',
  })
  @IsString()
  @IsOptional()
  Action?: string;

  @ApiPropertyOptional({
    description: 'Responsible person',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({
    description: 'PDRS available',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  pdrs_disponible?: boolean;

  @ApiPropertyOptional({
    description: 'Internal resource',
    example: 'Maintenance Team',
  })
  @IsString()
  @IsOptional()
  resource_intern?: string;

  @ApiPropertyOptional({
    description: 'External resource',
    example: 'External Contractor',
  })
  @IsString()
  @IsOptional()
  resource_extern?: string;

  @ApiPropertyOptional({
    description: 'Action status',
    enum: [
      'NOT_STARTED',
      'COMPLETED',
      'BLOCKED',
      'CANCELLED',
      'ON_HOLD',
      'IN_PROGRESS',
    ],
    example: 'IN_PROGRESS',
  })
  @IsEnum([
    'NOT_STARTED',
    'COMPLETED',
    'BLOCKED',
    'CANCELLED',
    'ON_HOLD',
    'IN_PROGRESS',
  ])
  @IsOptional()
  status?:
    | 'NOT_STARTED'
    | 'COMPLETED'
    | 'BLOCKED'
    | 'CANCELLED'
    | 'ON_HOLD'
    | 'IN_PROGRESS';
}

// DTO for response (includes id and relations)
export class ActionPlanResponseDto {
  @ApiProperty({ description: 'Action plan ID', example: 'ap_clr123abc456' })
  id: string;

  @ApiPropertyOptional({
    description: 'Action description',
    example: 'Replace faulty component',
  })
  Action?: string;

  @ApiPropertyOptional({
    description: 'Responsible person',
    example: 'John Doe',
  })
  responsable?: string;

  @ApiPropertyOptional({ description: 'PDRS available', example: true })
  pdrs_disponible?: boolean;

  @ApiPropertyOptional({
    description: 'Internal resource',
    example: 'Maintenance Team',
  })
  resource_intern?: string;

  @ApiPropertyOptional({
    description: 'External resource',
    example: 'External Contractor',
  })
  resource_extern?: string;

  @ApiPropertyOptional({ description: 'Action status', example: 'IN_PROGRESS' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Anomaly ID',
    example: 'anom_clr123abc456',
  })
  anomaly_id?: string;

  @ApiPropertyOptional({
    description: 'Associated anomaly details',
    example: {
      id: 'anom_clr123abc456',
      num_equipments: 'EQ-001-2024',
      descreption_anomalie: 'Equipment overheating',
      status: 'IN_PROGRESS',
    },
  })
  anomaly?: {
    id: string;
    num_equipments?: string;
    descreption_anomalie?: string;
    status?: string;
  };
}

// DTO for creating multiple action plans at once
export class CreateMultipleActionPlansDto {
  @ApiProperty({
    description: 'Anomaly ID',
    example: 'anom_clr123abc456',
  })
  @IsString()
  @IsNotEmpty()
  anomaly_id: string;

  @ApiProperty({
    description: 'Array of action plans to create',
    type: [CreateActionPlanDto],
    example: [
      {
        Action: 'Replace faulty component',
        responsable: 'John Doe',
        status: 'IN_PROGRESS',
      },
    ],
  })
  action_plans: Omit<CreateActionPlanDto, 'anomaly_id'>[];
}
