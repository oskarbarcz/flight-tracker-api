import { PartialType } from '@nestjs/swagger';
import { CreateFlightRequest } from './create-flight.dto';

export class UpdateFlightDto extends PartialType(CreateFlightRequest) {}
