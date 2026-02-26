import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Rotation } from '../../../model/rotation.model';

export class CreateRotationRequest extends PickType(Rotation, [
  'name',
  'pilotId',
]) {}

export class UpdateRotationRequest extends PartialType(CreateRotationRequest) {}

export class GetRotationResponse extends OmitType(Rotation, ['pilotId']) {}
