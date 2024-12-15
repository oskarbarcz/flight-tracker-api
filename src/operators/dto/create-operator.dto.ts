import { OmitType } from '@nestjs/swagger';
import { Operator } from '../entities/operator.entity';

export class CreateOperatorDto extends OmitType(Operator, ['id']) {}
