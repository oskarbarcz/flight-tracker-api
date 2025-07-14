import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Rotation } from '../entity/rotation.entity';

export class CreateRotationRequest extends PickType(Rotation, [
  'name',
  'pilotId',
]) {}

export class CreateRotationResponse extends OmitType(Rotation, ['pilotId']) {}

export class UpdateRotationRequest extends PartialType(CreateRotationRequest) {}
