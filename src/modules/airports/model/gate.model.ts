import { ApiProperty } from '@nestjs/swagger';
import { YesOrNoString } from 'src/core/types/monada';
import { TerminalId } from './terminal.model';

type GateId = string & {};

type BridgeOption = YesOrNoString;

enum StairOption {
  No = 'no',
  WithBus = 'with-bus-transport',
  WithPassengerWalking = 'with-passenger-walking',
  WithBusOrPassengerWalking = 'with-bus-or-passenger-walking',
}

enum DeicingOption {
  No = 'no',
  Possible = 'possible',
  Recommended = 'recommended',
  Mandatory = 'mandatory',
}

enum GpuAvailability {
  No = 'no',
  Bridge = 'bridge',
  Standalone = 'standalone',
  Both = 'both',
}

enum PcaAvailability {
  No = 'no',
  Bridge = 'bridge',
  Standalone = 'standalone',
  Both = 'both',
}

enum ParkingPositionType {
  Angled = 'angled',
  StraightIn = 'straight-in',
  AngledTaxiThrough = 'angled-taxi-through',
  StraightInTaxiThrough = 'straight-in-taxi-through',
}

enum ParkingLocation {
  Remote = 'remote',
  Gate = 'gate',
}

enum ParkingSpotType {
  Passenger = 'passenger',
  Cargo = 'cargo',
  Other = 'other',
}

enum ParkingAssistanceType {
  None = 'none',
  Vdgs = 'vdgs',
  Marshaller = 'marshaller',
  VdgsOrMashaller = 'vdgs-or-marshaller',
}

enum FuelingOptions {
  None = 'none',
  Truck = 'truck',
  Hydrant = 'hydrant',
}

type NoiseSensitivityOption = YesOrNoString;

export class GateBriefing {
  @ApiProperty({
    description: 'Gate unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  id!: GateId;

  @ApiProperty({
    description: 'Gate unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  airportId!: string;

  @ApiProperty({
    description: 'Gate unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  terminalId!: TerminalId;

  @ApiProperty({
    description: 'Gate name',
    example: '575',
  })
  name!: string;
  bridge!: BridgeOption;
  stairs!: StairOption;
  deicing!: DeicingOption;
  gpu!: GpuAvailability;
  pca!: PcaAvailability;
  parkingPositionType!: ParkingPositionType;
  parkingSpotType!: ParkingSpotType;
  parkingAssistance!: ParkingAssistanceType;
  location!: ParkingLocation;
  noiseSensitivity!: NoiseSensitivityOption;
  fuelingOptions!: FuelingOptions;
}
