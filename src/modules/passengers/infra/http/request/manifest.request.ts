import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PassengerStatus } from '../../../model/manifest.model';

export class ManifestFilters {
  @ApiPropertyOptional({
    description: 'Return only passengers with this status',
    enum: PassengerStatus,
    example: PassengerStatus.Boarded,
  })
  @IsOptional()
  @IsEnum(PassengerStatus)
  status?: PassengerStatus;
}
