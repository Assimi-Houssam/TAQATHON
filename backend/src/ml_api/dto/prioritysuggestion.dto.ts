import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PrioritySuggestionDto {
  @ApiPropertyOptional({
    description: 'Anomaly description for priority estimation',
    example: 'Equipment overheating causing production delays',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Unique identifier for the request',
    example: 'uid_123abc456',
  })
  @IsString()
  @IsOptional()
  uid?: string;
}
