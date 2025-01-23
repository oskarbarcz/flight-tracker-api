import { PartialType } from '@nestjs/swagger';
import {
  CreateAircraftRequest,
  CreateAircraftResponse,
} from './create-aircraft.dto';

export class UpdateAircraftRequest extends PartialType(CreateAircraftRequest) {}
export class UpdateAircraftResponse extends PartialType(
  CreateAircraftResponse,
) {}
