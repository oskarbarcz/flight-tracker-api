import { OmitType, PartialType } from '@nestjs/swagger';
import { Runway } from '../../../model/runway.model';

export class CreateRunwayRequest extends OmitType(Runway, [
  'id',
  'airportId',
]) {}

export class UpdateRunwayRequest extends PartialType(CreateRunwayRequest) {}

export class GetRunwayResponse extends Runway {}
