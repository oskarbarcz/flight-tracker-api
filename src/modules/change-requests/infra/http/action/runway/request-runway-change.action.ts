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
import { RequestRunwayChangeRequest } from '../../request/change-request.dto';
import {
  ChangeRequestResource,
  ChangeRequestWithFields,
} from '../../../../model/change-request.model';
import { AssertRunwayExistsQuery } from '../../../../../airports/application/assert/assert-runway-exists.query';
import { SubmitChangeRequestCommand } from '../../../../application/command/submit-change-request.command';
import { GetChangeRequestByIdQuery } from '../../../../application/query/get-change-request-by-id.query';

@ApiTags('airport runway')
@Controller('api/v1/airport/:airportId/runway/:runwayId/request-data-change')
export class RequestRunwayChangeAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Propose a change to a runway',
    description:
      'Files the proposed values for review. The runway is not changed until a reviewer accepts the request. ' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'runwayId', description: 'Runway unique identifier' })
  @ApiBody({ type: RequestRunwayChangeRequest })
  @ApiCreatedResponse({ type: ChangeRequestWithFields })
  @ApiBadRequestResponse({
    type: GenericBadRequestResponse<RequestRunwayChangeRequest>,
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
    @UuidParam('runwayId') runwayId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: RequestRunwayChangeRequest,
  ): Promise<ChangeRequestWithFields> {
    const assertion = new AssertRunwayExistsQuery(airportId, runwayId);
    await this.queryBus.execute(assertion);

    const command = new SubmitChangeRequestCommand(
      ChangeRequestResource.runway,
      runwayId,
      body,
      request.user.sub,
    );
    const changeRequestId = await this.commandBus.execute(command);

    const query = new GetChangeRequestByIdQuery(changeRequestId);
    return this.queryBus.execute(query);
  }
}
