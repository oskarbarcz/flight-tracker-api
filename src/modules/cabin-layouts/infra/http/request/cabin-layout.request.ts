import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { CabinLayout } from '../../../model/cabin-layout.model';

export const DEFAULT_LAYOUT_PAGE_SIZE = 50;

export class ListCabinLayoutsRequest {
  @ApiPropertyOptional({ description: 'Airline IATA code', example: 'LH' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  airlineIata?: string;

  @ApiPropertyOptional({
    description: 'Aircraft IATA type code',
    example: '32N',
  })
  @IsOptional()
  @IsString()
  @Length(2, 6)
  aircraftIata?: string;

  @ApiPropertyOptional({
    description:
      'Filter to layouts AeroLOPA has withdrawn, or to those it still publishes',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  retired?: boolean;

  @ApiPropertyOptional({
    example: DEFAULT_LAYOUT_PAGE_SIZE,
    default: DEFAULT_LAYOUT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class CabinLayoutList {
  @ApiProperty({ type: CabinLayout, isArray: true })
  items!: CabinLayout[];

  @ApiProperty({
    description: 'Layouts matching the filters, ignoring paging',
    example: 1566,
  })
  total!: number;

  @ApiProperty({ example: DEFAULT_LAYOUT_PAGE_SIZE })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;
}
