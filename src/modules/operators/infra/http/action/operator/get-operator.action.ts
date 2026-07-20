import { Controller, Get } from '@nestjs/common';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Operator } from '../../../../model/operator.model';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetOperatorByIdQuery } from '../../../../application/query/get-operator-by-id.query';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class GetOperatorAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Retrieve one operator' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiOkResponse({ type: Operator })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':id')
  findOne(@UuidParam('id') id: string): Promise<Operator> {
    const query = new GetOperatorByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
