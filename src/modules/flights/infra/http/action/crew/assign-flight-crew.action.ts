import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { Crew } from '../../../../../operators/model/crew.model';
import { AssignCrewMemberToFlightCommand } from '../../../../../operators/application/command/crew/assign-crew-member-to-flight.command';
import { ListFlightCrewQuery } from '../../../../../operators/application/query/crew/list-flight-crew.query';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';
import { assertCrewIsModifiable } from '../../../../model/crew-assignment.policy';
import { AssignFlightCrewRequest } from '../../request/crew.dto';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { GenericConflictResponse } from '../../../../../../core/http/response/conflict.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';

@ApiTags('flight crew')
@Controller('api/v1/flight/:flightId/crew')
export class AssignFlightCrewAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Assign a crew member to a flight' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiBody({ type: AssignFlightCrewRequest })
  @ApiCreatedResponse({ type: Crew, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({ type: GenericConflictResponse })
  @Post()
  @Role(UserRole.Operations)
  async run(
    @UuidParam('flightId') flightId: string,
    @Body() body: AssignFlightCrewRequest,
  ): Promise<Crew[]> {
    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));
    assertCrewIsModifiable(flight.status);

    const command = new AssignCrewMemberToFlightCommand(
      flightId,
      flight.operator.id,
      body.crewId,
    );
    await this.commandBus.execute(command);

    return this.queryBus.execute(new ListFlightCrewQuery(flightId));
  }
}
