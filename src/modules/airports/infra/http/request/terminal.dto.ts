import { OmitType, PartialType } from '@nestjs/swagger';
import { Terminal } from '../../../model/terminal.model';

export class CreateTerminalRequest extends OmitType(Terminal, [
  'id',
  'airportId',
]) {}

export class UpdateTerminalRequest extends PartialType(CreateTerminalRequest) {}

export class GetTerminalResponse extends Terminal {}
