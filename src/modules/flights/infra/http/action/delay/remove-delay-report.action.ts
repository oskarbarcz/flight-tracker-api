import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
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
import { RemoveDelayReportCommand } from '../../../../application/command/delay/remove-delay-report.command';

@ApiTags('flight delay')
@Controller('api/v1/flight/:flightId/delay/:reportId')
export class RemoveDelayReportAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Remove a delay allocation report',
    description:
      'Removes a delay report that has not yet been accepted. An accepted report is frozen and cannot be removed. ' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
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
    description: 'The report has already been accepted and is frozen.',
  })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  public async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('reportId') reportId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new RemoveDelayReportCommand(flightId, reportId),
    );
  }
}
