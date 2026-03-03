import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Operator, OperatorType } from '../../../model/operator.model';
import { Continent } from '../../../../airports/model/airport.model';

class OperatorRequestFields extends OmitType(Operator, [
  'id',
  'fleetSize',
  'fleetTypes',
]) {}

export class CreateOperatorRequest extends OperatorRequestFields {
  hubs: string[] = [];
  continent: Continent = Continent.Europe;
  type: OperatorType = OperatorType.Legacy;
  avgFleetAge: number = 5;
}

export class UpdateOperatorRequest extends PartialType(OperatorRequestFields) {}

export class LegacyOperatorResponse extends PickType(Operator, [
  'id',
  'icaoCode',
  'iataCode',
  'shortName',
  'fullName',
  'callsign',
]) {}
