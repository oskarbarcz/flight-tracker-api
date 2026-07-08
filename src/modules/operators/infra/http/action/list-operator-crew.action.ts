import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Crew } from '../../../model/crew.model';
import { ListOperatorCrewQuery } from '../../../application/query/crew/list-operator-crew.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';

@ApiTags('operator crew')
@Controller('/api/v1/operator/:operatorId/crew')
export class ListOperatorCrewAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all crew for operator' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiOkResponse({ type: Crew, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  async run(@UuidParam('operatorId') operatorId: string): Promise<Crew[]> {
    const query = new ListOperatorCrewQuery(operatorId);
    return this.queryBus.execute(query);
  }
}
