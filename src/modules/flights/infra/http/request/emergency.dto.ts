import { Emergency } from '../../../model/emergency.model';
import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { DangerousGoodsClass } from '../../../model/emergency.model';

export class DeclareEmergencyRequest extends PickType(Emergency, [
  'urgency',
  'threatLevel',
  'category',
  'squawk',
  'intention',
  'lastKnownPosition',
  'fuelEnduranceMinutes',
  'freeText',
]) {
  @ApiPropertyOptional({
    description:
      'IATA/ICAO dangerous goods classes carried on this flight. Omit to have them read from the cargo manifest; send an empty array to declare none.',
    example: [DangerousGoodsClass.Class3FlammableLiquids],
    enum: DangerousGoodsClass,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DangerousGoodsClass, { each: true })
  dangerousGoodsOnBoard?: DangerousGoodsClass[];
}

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
