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
import { UserRole } from 'prisma/client/client';
import { v4 } from 'uuid';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import {
  CreateParkingPositionRequest,
  GetParkingPositionResponse,
} from '../../request/parking-position.dto';
import { CreateParkingPositionCommand } from '../../../../application/command/parking-positions/create-parking-position.command';
import { GetParkingPositionByIdQuery } from '../../../../application/query/parking-position/get-parking-position-by-id.query';

@ApiTags('airport parking position')
@Controller('api/v1/airport/:airportId/parking-position')
export class CreateParkingPositionAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new parking position at given airport',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiBody({ type: CreateParkingPositionRequest })
  @ApiCreatedResponse({ type: GetParkingPositionResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @Body() body: CreateParkingPositionRequest,
  ): Promise<GetParkingPositionResponse> {
    const parkingPositionId = v4();

    const command = new CreateParkingPositionCommand(
      airportId,
      parkingPositionId,
      body,
    );
    await this.commandBus.execute(command);

    const query = new GetParkingPositionByIdQuery(airportId, parkingPositionId);
    return this.queryBus.execute(query);
  }
}
