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
