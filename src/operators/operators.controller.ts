import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { uuid } from '../common/validation/uuid.param';

@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorsService.create(createOperatorDto);
  }

  @Get()
  findAll() {
    return this.operatorsService.findAll();
  }

  @Get(':id')
  findOne(@uuid('id') id: string) {
    return this.operatorsService.findOne(id);
  }

  @Patch(':id')
  update(@uuid('id') id: string, @Body() updateOperatorDto: UpdateOperatorDto) {
    return this.operatorsService.update(id, updateOperatorDto);
  }

  @Delete(':id')
  remove(@uuid('id') id: string) {
    return this.operatorsService.remove(id);
  }
}
