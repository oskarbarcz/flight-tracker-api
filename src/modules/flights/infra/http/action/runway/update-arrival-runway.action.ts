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
  UpdateArrivalRunwayRequest,
} from '../../request/flight.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';
import { UpdateArrivalRunwayCommand } from '../../../../application/command/update-arrival-runway.command';
import { AssertRunwayBelongsToAirportCommand } from '../../../../../airports/application/assert/assert-runway-belongs-to-airport.command';
import { AirportType } from '../../../../../airports/model/airport.model';

@ApiTags('flight')
@Controller('api/v1/flight')
export class UpdateArrivalRunwayAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update flight arrival runway',
    description:
      'Assigns the arrival runway to a flight. <br />' +
      '**NOTE:** This action is only allowed before the flight is taxiing in. <br />' +
      '**NOTE:** This endpoint is available for `operations` and `cabin crew` roles.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiBody({ type: UpdateArrivalRunwayRequest })
  @ApiOkResponse({ type: GetFlightResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch('/:id/arrival-runway')
  @Role(UserRole.Operations, UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
    @Body() body: UpdateArrivalRunwayRequest,
  ): Promise<GetFlightResponse> {
    const findFlightQuery = new GetFlightQuery(id);
    const flight: GetFlightResponse =
      await this.queryBus.execute(findFlightQuery);
    const arrivalAirportId = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    )!.id;

    const assertCommand = new AssertRunwayBelongsToAirportCommand(
      arrivalAirportId,
      body.arrivalRunwayId,
    );
    await this.commandBus.execute(assertCommand);

    const updateCommand = new UpdateArrivalRunwayCommand(
      id,
      request.user,
      body.arrivalRunwayId,
    );
    await this.commandBus.execute(updateCommand);

    const reloadQuery = new GetFlightQuery(id);
    return this.queryBus.execute(reloadQuery);
  }
}
