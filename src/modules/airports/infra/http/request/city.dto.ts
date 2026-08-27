import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

function asBoolean(value: unknown): unknown {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
}

export class ListCitiesFilters {
  @ApiPropertyOptional({
    description:
      'Keep only the cities that have a postcard, or only those that have none',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => asBoolean(value))
  @IsBoolean()
  hasPostcard?: boolean;
}
