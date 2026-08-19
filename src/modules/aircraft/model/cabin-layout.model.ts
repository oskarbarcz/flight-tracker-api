import { ApiProperty } from '@nestjs/swagger';

export class AircraftCabinLayout {
  @ApiProperty({
    description: 'AeroLOPA layout identifier',
    example: 'aa-77w',
  })
  id!: string;

  @ApiProperty({ description: 'Airline the layout belongs to', example: 'AA' })
  airlineIata!: string;

  @ApiProperty({
    description: 'Aircraft IATA type code the layout was drawn for',
    example: '77W',
  })
  aircraftIata!: string;

  @ApiProperty({
    description:
      'Discriminator separating several layouts of one airline and aircraft type',
    example: null,
    nullable: true,
  })
  variant!: string | null;

  @ApiProperty({
    description:
      'Newest stored revision of the layout, which the aircraft follows; null until the seat map has been read for the first time',
    example: 1,
    nullable: true,
  })
  revision!: number | null;

  @ApiProperty({
    description: 'AeroLOPA no longer publishes this layout',
    example: false,
  })
  retired!: boolean;

  @ApiProperty({
    description:
      "The layout's airline or aircraft type differs from the aircraft's own; assignment permits it, clients may flag it",
    example: false,
  })
  mismatched!: boolean;
}
