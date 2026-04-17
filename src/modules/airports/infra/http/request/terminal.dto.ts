import { TerminalBriefing } from '../../../model/terminal.model';
import { OmitType, PartialType } from '@nestjs/swagger';

export class CreateTerminalRequest extends OmitType(TerminalBriefing, ['id']) {}

export class UpdateTerminalRequest extends PartialType(CreateTerminalRequest) {}

export class GetTerminalResponse extends TerminalBriefing {}
