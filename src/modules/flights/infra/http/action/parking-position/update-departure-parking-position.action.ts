import { Body, Controller, Patch, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import {
  GetFlightResponse,
  UpdateDepartureParkingPositionRequest,
} from '../../request/flight.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';
import { UpdateDepartureParkingPositionCommand } from '../../../../application/command/update-departure-parking-position.command';
import { AssertParkingPositionBelongsToAirportCommand } from '../../../../../airports/application/assert/assert-parking-position-belongs-to-airport.command';
import { AirportType } from '../../../../../airports/model/airport.model';

@ApiTags('flight')
@Controller('api/v1/flight')
export class UpdateDepartureParkingPositionAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update flight departure parking position',
    description:
      'Assigns the departure parking position to a flight. <br />' +
      '**NOTE:** This action is only allowed while the flight is in `created` or `ready` status (before the pilot has checked in). <br />' +
      '**NOTE:** This endpoint is available for `operations` and `cabin crew` roles.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiBody({ type: UpdateDepartureParkingPositionRequest })
  @ApiOkResponse({ type: GetFlightResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch('/:id/departure-parking-position')
  @Role(UserRole.Operations, UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
    @Body() body: UpdateDepartureParkingPositionRequest,
  ): Promise<GetFlightResponse> {
    const findFlightQuery = new GetFlightQuery(id);
    const flight: GetFlightResponse =
      await this.queryBus.execute(findFlightQuery);
    const departureAirportId = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    )!.id;

    const assertCommand = new AssertParkingPositionBelongsToAirportCommand(
      departureAirportId,
      body.departureParkingPositionId,
    );
    await this.commandBus.execute(assertCommand);

    const updateCommand = new UpdateDepartureParkingPositionCommand(
      id,
      request.user,
      body.departureParkingPositionId,
    );
    await this.commandBus.execute(updateCommand);

    const reloadQuery = new GetFlightQuery(id);
    return this.queryBus.execute(reloadQuery);
  }
}
