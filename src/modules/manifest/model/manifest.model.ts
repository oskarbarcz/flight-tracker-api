import { ApiProperty } from '@nestjs/swagger';
import { CabinDeckName } from '../../cabin-layouts/model/layout-version';

export enum PassengerStatus {
  Boarded = 'boarded',
  NoShow = 'no_show',
}

export enum PassengerSpecialService {
  Infant = 'INFT',
  WheelchairRamp = 'WCHR',
  WheelchairSteps = 'WCHS',
  WheelchairCabin = 'WCHC',
  UnaccompaniedMinor = 'UMNR',
  Blind = 'BLND',
  Deaf = 'DEAF',
  MeetAndAssist = 'MAAS',
  PetInCabin = 'PETC',
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

  @ApiProperty({
    description:
      'IATA special service request the passenger travels with; null when they need none',
    enum: PassengerSpecialService,
    example: PassengerSpecialService.WheelchairRamp,
    nullable: true,
  })
  ssr!: PassengerSpecialService | null;
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

  @ApiProperty({
    description:
      'Passengers the manifest reports, counting only those matching the status filter when one is given',
    example: 150,
  })
  passengerCount!: number;

  @ApiProperty({
    description:
      'Reported passengers per commercial cabin, on the same filtered basis as `passengerCount`',
    example: { business: 24, economy: 126 },
    type: Object,
  })
  passengersByCabin!: Record<string, number>;

  @ApiProperty({ type: ManifestPassenger, isArray: true })
  passengers!: ManifestPassenger[];
}
