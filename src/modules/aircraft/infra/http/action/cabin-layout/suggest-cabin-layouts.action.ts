import {
  ApiBadRequestResponse,
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
import { QueryBus } from '@nestjs/cqrs';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { CabinLayoutSuggestionList } from '../../../../../cabin-layouts/model/cabin-layout-suggestion.model';
import { SuggestAircraftCabinLayoutsQuery } from '../../../../application/query/suggest-aircraft-cabin-layouts.query';

@ApiTags('aircraft')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class SuggestCabinLayoutsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List cabin layouts worth assigning to an aircraft',
    description:
      'Ranks layouts matching both the operator and the aircraft type first, then the operator ' +
      'alone, then the type alone. The list is a suggestion: any catalogued layout may be ' +
      'assigned, including one it does not name.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'operatorId',
    description: 'Operator unique identifier',
  })
  @ApiParam({
    name: 'aircraftId',
    description: 'Aircraft unique identifier',
  })
  @ApiOkResponse({ type: CabinLayoutSuggestionList })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':aircraftId/cabin-layout/suggestions')
  @Role(UserRole.Operations)
  async suggest(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
  ): Promise<CabinLayoutSuggestionList> {
    const query = new SuggestAircraftCabinLayoutsQuery(operatorId, aircraftId);
    return this.queryBus.execute(query);
  }
}
