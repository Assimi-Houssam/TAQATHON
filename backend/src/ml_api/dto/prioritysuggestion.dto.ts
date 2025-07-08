import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrioritySuggestionDto {
  @ApiProperty({
    description: 'Anomaly description for priority estimation',
    example: 'Equipment overheating causing production delays',
  })
  @IsString()
  description_anomaly: string;

  @ApiProperty({
    description: 'Equipment description for priority estimation',
    example: 'Production line equipment experiencing issues',
  })
  @IsString()
  description_equipement: string;
}
