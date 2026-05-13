import { Emergency } from '../../../model/emergency.model';
import { PartialType, PickType } from '@nestjs/swagger';

export class DeclareEmergencyRequest extends PickType(Emergency, [
  'urgency',
  'threatLevel',
  'category',
  'squawk',
  'intention',
  'lastKnownPosition',
  'fuelEnduranceMinutes',
  'dangerousGoodsOnBoard',
  'freeText',
]) {}

export class UpdateEmergencyRequest extends PartialType(
  DeclareEmergencyRequest,
) {}

export class GetEmergencyResponse extends PickType(Emergency, [
  'id',
  'urgency',
  'threatLevel',
  'category',
  'squawk',
  'intention',
  'lastKnownPosition',
  'soulsOnBoard',
  'fuelEnduranceMinutes',
  'dangerousGoodsOnBoard',
  'freeText',
  'declarationTime',
  'reportedBy',
  'resolvedAt',
  'resolvedBy',
]) {}
