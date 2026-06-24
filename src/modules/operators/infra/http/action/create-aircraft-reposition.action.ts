import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRepositionDto } from '../request/create-reposition.dto';
import { AircraftReposition } from '../../../model/reposition.model';
import { CreateManualRepositionCommand } from '../../../application/command/reposition/create-manual-reposition.command';
import { ListAircraftRepositionQuery } from '../../../application/query/reposition/list-aircraft-reposition.query';
import { GetAircraftByIdQuery } from '../../../application/query/aircraft/get-aircraft-by-id.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from 'prisma/client/enums';

@ApiTags('operator fleet')
@Controller('/api/v1/operator/:operatorId/aircraft')
export class CreateAircraftRepositionAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Reposition an aircraft to a chosen airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'operatorId', description: 'Operator unique identifier' })
  @ApiParam({ name: 'aircraftId', description: 'Aircraft unique identifier' })
  @ApiBody({ type: CreateRepositionDto })
  @ApiCreatedResponse({ type: AircraftReposition, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post(':aircraftId/reposition')
  @Role(UserRole.Operations)
  async run(
    @UuidParam('operatorId') operatorId: string,
    @UuidParam('aircraftId') aircraftId: string,
    @Body() createRepositionDto: CreateRepositionDto,
  ): Promise<AircraftReposition[]> {
    const getAircraftQuery = new GetAircraftByIdQuery(operatorId, aircraftId);
    await this.queryBus.execute(getAircraftQuery);

    const command = new CreateManualRepositionCommand(
      aircraftId,
      createRepositionDto.destinationAirportId,
    );
    await this.commandBus.execute(command);

    const query = new ListAircraftRepositionQuery(aircraftId);
    return this.queryBus.execute(query);
  }
}
