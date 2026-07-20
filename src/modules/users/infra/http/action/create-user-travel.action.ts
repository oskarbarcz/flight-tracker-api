import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTravelDto } from '../request/create-travel.dto';
import { UserTravel } from '../../../model/user-travel.model';
import { CreateManualTravelCommand } from '../../../application/command/create-manual-travel.command';
import { ListUserTravelQuery } from '../../../application/query/list-user-travel.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../model/user-role';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { CannotAccessOtherUsersTravelError } from '../../../model/error/user-travel.error';

@ApiTags('user')
@Controller('/api/v1/user')
export class CreateUserTravelAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Request a manual dead-head travel to a chosen airport',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiBody({ type: CreateTravelDto })
  @ApiCreatedResponse({
    type: UserTravel,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateTravelDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @Post(':id/travel')
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Body() createTravelDto: CreateTravelDto,
    @Req() request: AuthorizedRequest,
  ): Promise<UserTravel[]> {
    if (request.user.sub !== id) {
      throw new CannotAccessOtherUsersTravelError();
    }

    const command = new CreateManualTravelCommand(
      id,
      createTravelDto.destinationAirportId,
    );
    await this.commandBus.execute(command);

    const query = new ListUserTravelQuery(id);
    return this.queryBus.execute(query);
  }
}
