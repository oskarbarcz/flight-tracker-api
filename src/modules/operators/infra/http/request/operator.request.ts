import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
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

export class OperatorListFilters {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  'recent-only'?: boolean;
}

export class LegacyOperatorResponse extends PickType(Operator, [
  'id',
  'icaoCode',
  'iataCode',
  'shortName',
  'fullName',
  'callsign',
]) {}
