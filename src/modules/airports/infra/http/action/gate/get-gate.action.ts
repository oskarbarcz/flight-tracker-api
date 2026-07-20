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
import { GetGateResponse } from '../../request/gate.dto';
import { GetGateByIdQuery } from '../../../../application/query/gate/get-gate-by-id.query';

@ApiTags('airport gate')
@Controller('api/v1/airport/:airportId/gate')
export class GetGateAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one gate' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'gateId', description: 'Gate unique identifier' })
  @ApiOkResponse({ type: GetGateResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get(':gateId')
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('gateId') gateId: string,
  ): Promise<GetGateResponse> {
    const query = new GetGateByIdQuery(airportId, gateId);
    return this.queryBus.execute(query);
  }
}
