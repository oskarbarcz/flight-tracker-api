import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { uuid } from '../common/validation/uuid.param';
import { ApiTags, PartialType } from "@nestjs/swagger";
import { Operator } from './entities/operator.entity';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../common/dto/bad-request.dto';
import { GenericNotFoundResponse } from '../common/dto/not-found.dto';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @ApiOperation({ summary: 'Create new operator' })
  @ApiBody({
    description: 'Operator data',
    type: CreateOperatorDto,
  })
  @ApiCreatedResponse({
    description: 'Operator was created successfully',
    type: Operator,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateOperatorDto>,
  })
  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto): Promise<Operator> {
    return this.operatorsService.create(createOperatorDto);
  }

  @ApiOperation({ summary: 'Retrieve all operators' })
  @ApiOkResponse({
    description: 'Operators list',
    type: Operator,
    isArray: true,
  })
  @Get()
  findAll(): Promise<Operator[]> {
    return this.operatorsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one operator' })
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiOkResponse({
    description: 'Operator was created successfully',
    type: PartialType(Operator),
  })
  @ApiBadRequestResponse({
    description: 'Operator id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  findOne(@uuid('id') id: string): Promise<Operator> {
    return this.operatorsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update operator' })
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiBody({
    description: 'Operator data',
    type: UpdateOperatorDto,
  })
  @ApiOkResponse({
    description: 'Operator was updated successfully',
    type: Operator,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateOperatorDto>,
  })
  @ApiNotFoundResponse({
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  update(
    @uuid('id') id: string,
    @Body() updateOperatorDto: UpdateOperatorDto,
  ): Promise<Operator> {
    return this.operatorsService.update(id, updateOperatorDto);
  }

  @ApiOperation({ summary: 'Remove operator' })
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Operator was removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Operator id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiNotFoundResponse({
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@uuid('id') id: string): Promise<void> {
    return this.operatorsService.remove(id);
  }
}
