import { OmitType, PartialType } from '@nestjs/swagger';
import { ParkingPosition } from '../../../model/parking-position.model';

export class CreateParkingPositionRequest extends OmitType(ParkingPosition, [
  'id',
  'airportId',
]) {}

export class UpdateParkingPositionRequest extends PartialType(
  CreateParkingPositionRequest,
) {}

export class GetParkingPositionResponse extends ParkingPosition {}
