import { ApiProperty } from '@nestjs/swagger';
import { CabinDeckName } from '../../cabin-layouts/model/layout-version';

export enum PassengerStatus {
  Boarded = 'boarded',
  NoShow = 'no_show',
}

export class ManifestPassenger {
  @ApiProperty({ description: 'Seat the passenger occupies', example: '12A' })
  designator!: string;

  @ApiProperty({
    description: 'Deck the seat is on',
    enum: ['main', 'upper'],
    example: 'main',
  })
  deck!: CabinDeckName;

  @ApiProperty({
    description: 'Commercial cabin of the occupied seat',
    example: 'economy',
  })
  cabin!: string;

  @ApiProperty({ example: 'Willem de Vries' })
  name!: string;

  @ApiProperty({ description: 'Booking reference', example: 'K7QP2M' })
  pnr!: string;

  @ApiProperty({ enum: PassengerStatus, example: PassengerStatus.Boarded })
  status!: PassengerStatus;
}

export class FlightManifest {
  @ApiProperty({ example: 'c0e83544-cefd-41c8-9c60-aadfaaf08590' })
  flightId!: string;

  @ApiProperty({
    description: 'Cabin layout the flight was seated against',
    example: 'kl-738',
  })
  cabinLayout!: string;

  @ApiProperty({
    description:
      'Revision of that layout pinned when the flight was released; later revisions never move it',
    example: 1,
  })
  cabinLayoutRevision!: number;

  @ApiProperty({ description: 'Passengers on the manifest', example: 150 })
  passengerCount!: number;

  @ApiProperty({
    description: 'Passengers per commercial cabin',
    example: { business: 24, economy: 126 },
    type: Object,
  })
  passengersByCabin!: Record<string, number>;

  @ApiProperty({ type: ManifestPassenger, isArray: true })
  passengers!: ManifestPassenger[];
}
