import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { GetRotationResponse } from '../../request/rotation.request';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { ListAllRotationsQuery } from '../../../../application/query/rotation/list-all-rotations.query';

@ApiTags('operator rotations')
@Controller('/api/v1/operator/:operatorId/rotation')
export class ListRotationsAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Retrieve all rotations' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiOkResponse({ type: GetRotationResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  findAllForOperator(
    @UuidParam('operatorId') operatorId: string,
  ): Promise<GetRotationResponse[]> {
    const query = new ListAllRotationsQuery(operatorId);
    return this.queryBus.execute(query);
  }
}
