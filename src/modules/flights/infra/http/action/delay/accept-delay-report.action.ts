import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UserRole } from '../../../../../users/model/user-role';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { AcceptDelayReportCommand } from '../../../../application/command/delay/accept-delay-report.command';

@ApiTags('flight delay')
@Controller('api/v1/flight/:flightId/delay/:reportId/accept')
export class AcceptDelayReportAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Accept delay report',
    description:
      'Operations accepts a coded delay report. Once every report is accepted and the minutes fully allocate the total delay, the flight may be closed. ' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'reportId',
    description: 'Delay allocation report identifier',
  })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({
    description: 'The report has already been accepted.',
  })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  public async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('reportId') reportId: string,
    @Req() request: AuthorizedRequest,
  ): Promise<void> {
    const command = new AcceptDelayReportCommand(
      flightId,
      reportId,
      request.user.sub,
    );
    await this.commandBus.execute(command);
  }
}
