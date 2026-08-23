import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CargoShipmentStatusName } from '../../../model/cargo-manifest.model';

export class CargoManifestFilters {
  @ApiPropertyOptional({
    description: 'Return only shipments with this status',
    enum: CargoShipmentStatusName,
    example: CargoShipmentStatusName.Loaded,
  })
  @IsOptional()
  @IsEnum(CargoShipmentStatusName)
  status?: CargoShipmentStatusName;
}
