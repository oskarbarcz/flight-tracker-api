import { Injectable } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Injectable()
export class OperatorsService {
  create(createOperatorDto: CreateOperatorDto) {
    return 'This action adds a new operator';
  }

  findAll() {
    return `This action returns all operators`;
  }

  findOne(id: string) {
    return `This action returns a #${id} operator`;
  }

  update(id: string, updateOperatorDto: UpdateOperatorDto) {
    return `This action updates a #${id} operator`;
  }

  remove(id: string) {
    return `This action removes a #${id} operator`;
  }
}
