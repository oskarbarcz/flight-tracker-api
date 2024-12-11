import { PartialType } from '@nestjs/swagger';
import { CreateAircraftDto } from './create-aircraft.dto';

export class UpdateAircraftDto extends PartialType(CreateAircraftDto) {}
