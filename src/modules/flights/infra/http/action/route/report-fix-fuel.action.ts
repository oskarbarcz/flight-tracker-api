import { Body, Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { ReportFixFuelCommand } from '../../../../application/command/report-fix-fuel.command';
import { GetPlannedRouteQuery } from '../../../../application/query/get-planned-route.query';
import {
  PlannedRouteResponse,
  ReportFixFuelRequest,
} from '../../request/planned-route.dto';

@ApiTags('flight')
@Controller('api/v1/flight')
export class ReportFixFuelAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Report actual fuel over a fix of the planned route',
    description:
      'Saves the fuel on board the pilot read over a fix and answers the route with it. ' +
      'Reporting the same fix again replaces the earlier figure. <br />' +
      '**NOTE:** This action is only allowed while the flight is in cruise. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'ordinal',
    description: 'Position of the fix along the route, counting from zero',
  })
  @ApiBody({ type: ReportFixFuelRequest })
  @ApiOkResponse({ type: PlannedRouteResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description: 'The flight is not in cruise',
  })
  @Put('/:id/route/fix/:ordinal/fuel-report')
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Param('ordinal', ParseIntPipe) ordinal: number,
    @Body() body: ReportFixFuelRequest,
  ): Promise<PlannedRouteResponse> {
    await this.commandBus.execute(
      new ReportFixFuelCommand(id, ordinal, body.actualOnBoard),
    );

    return this.queryBus.execute(new GetPlannedRouteQuery(id));
  }
}
