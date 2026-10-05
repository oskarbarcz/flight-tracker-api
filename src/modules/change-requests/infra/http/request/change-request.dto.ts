import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAirportRequest } from '../../../../airports/infra/http/request/airport.dto';
import { Coordinates } from '../../../../airports/model/airport.model';
import { ParkingPosition } from '../../../../airports/model/parking-position.model';
import { Gate } from '../../../../airports/model/gate.model';
import { Terminal } from '../../../../airports/model/terminal.model';
import { Runway } from '../../../../airports/model/runway.model';
import { PARKING_POSITION_FIELDS } from '../../../model/parking-position-change.model';
import { GATE_FIELDS } from '../../../model/gate-change.model';
import { TERMINAL_FIELDS } from '../../../model/terminal-change.model';
import { RUNWAY_FIELDS } from '../../../model/runway-change.model';
import {
  ChangeRequestResource,
  ChangeRequestStatus,
} from '../../../model/change-request.model';

export class ChangeRequestListFilters {
  @ApiProperty({ required: false, enum: ChangeRequestStatus })
  @IsOptional()
  @IsEnum(ChangeRequestStatus)
  status?: ChangeRequestStatus;

  @ApiProperty({ required: false, enum: ChangeRequestResource })
  @IsOptional()
  @IsEnum(ChangeRequestResource)
  resource?: ChangeRequestResource;
}

export class MyChangeRequestListFilters extends PickType(
  ChangeRequestListFilters,
  ['status'],
) {}

export class RejectChangeRequestRequest {
  @ApiProperty({
    description: 'Reason the reviewer gives for turning the change down.',
    example: 'Boston is in North America.',
  })
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}

export class RequestAirportChangeRequest extends PartialType(
  PickType(CreateAirportRequest, [
    'name',
    'continent',
    'country',
    'timezone',
    'location',
    'shape',
  ]),
  { skipNullProperties: false },
) {
  @ApiProperty({
    description: 'Airport coordinates',
    type: Coordinates,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @ValidateNested()
  @Type(() => Coordinates)
  location?: Coordinates;

  @ApiProperty({
    description:
      'Unique system identifier of an existing city to move the airport to',
    example: '5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83',
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsUUID()
  cityId?: string;
}

export class RequestParkingPositionChangeRequest extends PartialType(
  PickType(ParkingPosition, PARKING_POSITION_FIELDS),
  { skipNullProperties: false },
) {}

export class RequestGateChangeRequest extends PartialType(
  PickType(Gate, GATE_FIELDS),
  { skipNullProperties: false },
) {}

export class RequestTerminalChangeRequest extends PartialType(
  PickType(Terminal, TERMINAL_FIELDS),
  { skipNullProperties: false },
) {}

export class RequestRunwayChangeRequest extends PartialType(
  PickType(Runway, RUNWAY_FIELDS),
  { skipNullProperties: false },
) {}
