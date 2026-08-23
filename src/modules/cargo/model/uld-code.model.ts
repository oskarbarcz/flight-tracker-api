import { ApiProperty } from '@nestjs/swagger';

export enum UldBaseCode {
  Ld3 = 'K',
  Pallet88 = 'A',
  Pallet96 = 'M',
}

export enum UldContourCode {
  Ld3FullHeight = 'E',
  Ld3ReducedHeight = 'H',
  Ld3Active = 'N',
  Pallet88Contoured = 'G',
  Pallet96Contoured = 'C',
  Pallet96Active = 'P',
  MainDeckContainer = 'A',
}

export class UldBaseDimensions {
  @ApiProperty({ description: 'Base depth in millimetres', example: 1534 })
  depthMm!: number;

  @ApiProperty({ description: 'Base width in millimetres', example: 1562 })
  widthMm!: number;
}

export const ULD_BASE_DIMENSIONS: Record<UldBaseCode, UldBaseDimensions> = {
  [UldBaseCode.Ld3]: { depthMm: 1534, widthMm: 1562 },
  [UldBaseCode.Pallet88]: { depthMm: 2235, widthMm: 3175 },
  [UldBaseCode.Pallet96]: { depthMm: 2438, widthMm: 3175 },
};

export const ULD_BASE_CODES: UldBaseCode[] = Object.values(UldBaseCode);
export const ULD_CONTOUR_CODES: UldContourCode[] =
  Object.values(UldContourCode);
