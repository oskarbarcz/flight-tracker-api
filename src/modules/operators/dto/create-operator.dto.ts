import { OmitType } from '@nestjs/swagger';
import { Operator } from '../entity/operator.entity';

export class CreateOperatorDto extends OmitType(Operator, ['id']) {}
