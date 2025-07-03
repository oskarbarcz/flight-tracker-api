import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Rotation } from '../entities/rotation.entity';

export class CreateRotationRequest extends PickType(Rotation, [
  'name',
  'pilotId',
]) {}

export class CreateRotationResponse extends OmitType(Rotation, [
  'flights',
  'pilotId',
]) {}

export class UpdateRotationRequest extends PartialType(CreateRotationRequest) {}
