import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UserRole } from '../../../../../users/model/user-role';
import { PushAirportOsmDataCommand } from '../../../../application/command/osm/push-airport-osm-data.command';
import {
  PushAirportOsmDataRequest,
  PushAirportOsmDataResponse,
} from '../../request/osm-upgrade.dto';

@ApiTags('airport data enrichment')
@Controller('api/v1/airport/:airportId/enrich')
export class PushOsmDataAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Write reviewed OpenStreetMap changes into the airport',
    description:
      'Applies the proposed changes named in `items`, and only those. Keys come from `GET` on this path, which has to ' +
      'have been called first — the values written are the ones that pull retained, not values taken from this ' +
      'request.\n\n' +
      'Records are never removed: a runway the airport holds and OpenStreetMap does not is left alone. A change ' +
      'the airport has caught up with since the review is reported as skipped rather than written twice, and one ' +
      'change failing does not abort the others — every key is answered for in the response.\n\n' +
      'Stands need their terminal and gates need both; push a dependency alongside the change that needs it, or ' +
      'that change is reported as failed. The proposal names them in `requires`.\n\n' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: PushAirportOsmDataRequest })
  @ApiOkResponse({ type: PushAirportOsmDataResponse })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<PushAirportOsmDataRequest>,
    description: 'The retained pull proposes no change under one of these keys',
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({
    description: 'No OpenStreetMap pull is held for this airport to push from',
  })
  @Post()
  @HttpCode(200)
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @Body() body: PushAirportOsmDataRequest,
  ): Promise<PushAirportOsmDataResponse> {
    const command = new PushAirportOsmDataCommand(airportId, body.items);
    return this.commandBus.execute(command);
  }
}
