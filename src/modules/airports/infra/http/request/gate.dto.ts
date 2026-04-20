import { OmitType, PartialType } from '@nestjs/swagger';
import { Gate } from '../../../model/gate.model';

export class CreateGateRequest extends OmitType(Gate, ['id', 'airportId']) {}

export class UpdateGateRequest extends PartialType(CreateGateRequest) {}

export class GetGateResponse extends Gate {}
