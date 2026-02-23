import { OmitType, PartialType } from '@nestjs/swagger';
import { Operator } from '../../model/operator.model';

export class CreateOperatorDto extends OmitType(Operator, ['id']) {}

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {}
