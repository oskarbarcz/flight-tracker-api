import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { GetAircraftResponse } from '../../request/aircraft.request';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { ListAllAircraftQuery } from '../../../../application/query/aircraft/list-all-aircraft.query';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class ListAircraftAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Retrieve all aircraft for operator' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    type: GetAircraftResponse,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Resource ID is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async findAllForOperator(
    @UuidParam('operatorId') operatorId: string,
  ): Promise<GetAircraftResponse[]> {
    const query = new ListAllAircraftQuery(operatorId);
    return this.queryBus.execute(query);
  }
}
