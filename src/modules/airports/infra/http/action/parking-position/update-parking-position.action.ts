import { Body, Controller, Patch } from '@nestjs/common';
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
import { UserRole } from '../../../../../users/model/user-role';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import {
  GetParkingPositionResponse,
  UpdateParkingPositionRequest,
} from '../../request/parking-position.dto';
import { UpdateParkingPositionCommand } from '../../../../application/command/parking-positions/update-parking-position.command';
import { GetParkingPositionByIdQuery } from '../../../../application/query/parking-position/get-parking-position-by-id.query';

@ApiTags('airport parking position')
@Controller('api/v1/airport/:airportId/parking-position')
export class UpdateParkingPositionAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update parking position',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({
    name: 'parkingPositionId',
    description: 'Parking position unique identifier',
  })
  @ApiBody({ type: UpdateParkingPositionRequest })
  @ApiOkResponse({ type: GetParkingPositionResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch(':parkingPositionId')
  @Role(UserRole.Operations)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('parkingPositionId') parkingPositionId: string,
    @Body() body: UpdateParkingPositionRequest,
  ): Promise<GetParkingPositionResponse> {
    const command = new UpdateParkingPositionCommand(
      airportId,
      parkingPositionId,
      body,
    );
    await this.commandBus.execute(command);

    const query = new GetParkingPositionByIdQuery(airportId, parkingPositionId);
    return this.queryBus.execute(query);
  }
}
