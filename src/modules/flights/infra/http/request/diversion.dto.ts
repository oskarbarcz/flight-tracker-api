import { Diversion } from '../../../model/diversion.model';
import { PickType } from '@nestjs/swagger';

export class ReportDiversionRequest extends PickType(Diversion, [
  'severity',
  'reason',
  'freeText',
  'position',
  'notifySecurityOnGround',
  'notifyMedicalOnGround',
  'notifyFirefightersOnGround',
  'airportId',
  'estimatedTimeAtDestination',
]) {}

export class GetDiversionResponse extends PickType(Diversion, [
  'id',
  'severity',
  'reason',
  'freeText',
  'position',
  'notifySecurityOnGround',
  'notifyMedicalOnGround',
  'notifyFirefightersOnGround',
  'airport',
  'decisionTime',
  'estimatedTimeAtDestination',
]) {}
