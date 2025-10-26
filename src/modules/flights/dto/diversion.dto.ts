import { Diversion } from '../entity/diversion.entity';
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
