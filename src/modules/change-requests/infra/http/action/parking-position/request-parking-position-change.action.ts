import { Body, Controller, Post, Req } from '@nestjs/common';
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { RequestParkingPositionChangeRequest } from '../../request/change-request.dto';
import {
  ChangeRequestResource,
  ChangeRequestWithFields,
} from '../../../../model/change-request.model';
import { AssertParkingPositionExistsQuery } from '../../../../../airports/application/assert/assert-parking-position-exists.query';
import { SubmitChangeRequestCommand } from '../../../../application/command/submit-change-request.command';
import { GetChangeRequestByIdQuery } from '../../../../application/query/get-change-request-by-id.query';

@ApiTags('airport parking position')
@Controller(
  'api/v1/airport/:airportId/parking-position/:parkingPositionId/request-data-change',
)
export class RequestParkingPositionChangeAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Propose a change to a parking position',
    description:
      'Files the proposed values for review. The parking position is not changed until a reviewer accepts the request. ' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({
    name: 'parkingPositionId',
    description: 'Parking position unique identifier',
  })
  @ApiBody({ type: RequestParkingPositionChangeRequest })
  @ApiCreatedResponse({ type: ChangeRequestWithFields })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<RequestParkingPositionChangeRequest>,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiUnprocessableEntityResponse({
    description: 'Every proposed value is equal to the value held now.',
  })
  @Post()
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('parkingPositionId') parkingPositionId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: RequestParkingPositionChangeRequest,
  ): Promise<ChangeRequestWithFields> {
    const assertion = new AssertParkingPositionExistsQuery(
      airportId,
      parkingPositionId,
    );
    await this.queryBus.execute(assertion);

    const command = new SubmitChangeRequestCommand(
      ChangeRequestResource.parkingPosition,
      parkingPositionId,
      body,
      request.user.sub,
    );
    const changeRequestId = await this.commandBus.execute(command);

    const query = new GetChangeRequestByIdQuery(changeRequestId);
    return this.queryBus.execute(query);
  }
}
