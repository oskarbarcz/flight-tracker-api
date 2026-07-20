import { Controller, Get } from '@nestjs/common';
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
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GetRunwayResponse } from '../../request/runway.dto';
import { GetRunwayByIdQuery } from '../../../../application/query/runway/get-runway-by-id.query';

@ApiTags('airport runway')
@Controller('api/v1/airport/:airportId/runway')
export class GetRunwayAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one runway' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'runwayId', description: 'Runway unique identifier' })
  @ApiOkResponse({ type: GetRunwayResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get(':runwayId')
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('runwayId') runwayId: string,
  ): Promise<GetRunwayResponse> {
    const query = new GetRunwayByIdQuery(airportId, runwayId);
    return this.queryBus.execute(query);
  }
}
