import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { ReportArrivalCommand } from '../../../../application/command/report-arrival.command';

@ApiTags('flight actions')
@Controller('api/v1/flight')
export class ReportArrivalAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Report flight has landed',
    description:
      '**NOTE:** This action is only allowed when aircraft has taken off. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post('/:id/report-arrival')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    const command = new ReportArrivalCommand(id, request.user.sub);
    await this.commandBus.execute(command);
  }
}
