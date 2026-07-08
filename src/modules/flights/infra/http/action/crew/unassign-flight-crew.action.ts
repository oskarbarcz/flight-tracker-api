import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { UnassignCrewMemberFromFlightCommand } from '../../../../../operators/application/command/crew/unassign-crew-member-from-flight.command';
import { GetFlightQuery } from '../../../../application/query/get-flight.query';
import { assertCrewIsModifiable } from '../../../../model/crew-assignment.policy';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';

@ApiTags('flight crew')
@Controller('api/v1/flight/:flightId/crew')
export class UnassignFlightCrewAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Unassign a crew member from a flight' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({ name: 'crewId', description: 'Crew member unique identifier' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Delete(':crewId')
  @Role(UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('crewId') crewId: string,
  ): Promise<void> {
    const flight = await this.queryBus.execute(new GetFlightQuery(flightId));
    assertCrewIsModifiable(flight.status);

    const command = new UnassignCrewMemberFromFlightCommand(flightId, crewId);
    await this.commandBus.execute(command);
  }
}
