import { PickType } from '@nestjs/swagger';
import { Operator } from '../../../../operators/model/operator.model';

export class ShortOperatorResponse extends PickType(Operator, [
  'id',
  'icaoCode',
  'iataCode',
  'shortName',
  'fullName',
  'callsign',
]) {}
