import { Controller, Get } from '@nestjs/common';
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
import { QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { GetDiversionResponse } from '../../request/diversion.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { GetDiversionQuery } from '../../../../application/query/diversion/get-diversion.query';

@ApiTags('flight diversion')
@Controller('api/v1/flight/:flightId/diversion')
export class GetDiversionAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get flight diversion details',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` or `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: GetDiversionResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  public async run(
    @UuidParam('flightId') flightId: string,
  ): Promise<GetDiversionResponse> {
    const query = new GetDiversionQuery(flightId);
    return this.queryBus.execute(query);
  }
}
