import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Rotation } from '../../operators/model/rotation.model';

export class LegacyCreateRotationRequest extends PickType(Rotation, [
  'name',
  'pilotId',
]) {}

export class LegacyUpdateRotationRequest extends PartialType(
  LegacyCreateRotationRequest,
) {}

export class LegacyGetRotationResponse extends OmitType(Rotation, ['pilotId']) {}
