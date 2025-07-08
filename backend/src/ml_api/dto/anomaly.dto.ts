import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CAnomalieDto {
  @ApiPropertyOptional({
    description: 'Equipment number',
    example: 'EQ-001-2024',
  })
  @IsString()
  @IsNotEmpty()
  num_equipments?: string;

  @ApiPropertyOptional({
    description: 'System name',
    example: 'Cooling System',
  })
  @IsString()
  @IsNotEmpty()
  systeme?: string;

  @ApiPropertyOptional({
    description: 'Anomaly description',
    example: 'Equipment overheating detected',
  })
  @IsString()
  @IsNotEmpty()
  descreption_anomalie?: string;

  @ApiPropertyOptional({
    description: 'Detection date',
    example: '2024-07-08T10:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date_detection?: string;

  @ApiPropertyOptional({
    description: 'Equipment description',
    example: 'Industrial cooling pump model XYZ-2000',
  })
  @IsString()
  @IsNotEmpty()
  descreption_equipment?: string;

  @ApiPropertyOptional({
    description: 'Owner section',
    example: 'Maintenance Team A',
  })
  @IsString()
  @IsNotEmpty()
  section_proprietaire?: string;

  @ApiPropertyOptional({
    description: 'Reliability integrity',
    example: 'High',
  })
  @IsString()
  @IsNotEmpty()
  fiablite_integrite?: string;

  @ApiPropertyOptional({
    description: 'Availability',
    example: 'Available',
  })
  @IsString()
  @IsNotEmpty()
  disponsibilite?: string;

  @ApiPropertyOptional({
    description: 'Process safety',
    example: 'Critical',
  })
  @IsString()
  @IsNotEmpty()
  process_safty?: string;

  @ApiPropertyOptional({
    description: 'Criticality level',
    example: '10',
  })
  @IsString()
  @IsNotEmpty()
  criticite?: string;
}