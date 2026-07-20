import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { UpdatePredictedTimesheetRequest } from '../../request/flight.dto';
import { UpdatePredictedTimesheetCommand } from '../../../../application/command/update-predicted-timesheet.command';

@ApiTags('flight')
@Controller('api/v1/flight')
export class UpdatePredictedTimesheetAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update flight predicted timesheet',
    description:
      'Partial-merge update of the predicted timesheet ' +
      '(`arrivalTime`, `onBlockTime`, `takeoffTime`, `offBlockTime`). ' +
      'Omitted fields preserve the stored value; explicit `null` clears it. ' +
      'Each field is rejected once its matching actual event has been reported.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'id', description: 'Flight unique identifier' })
  @ApiBody({ type: UpdatePredictedTimesheetRequest })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch('/:id/timesheet/predicted')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.CabinCrew)
  async run(
    @UuidParam('id') id: string,
    @Req() request: AuthorizedRequest,
    @Body() body: UpdatePredictedTimesheetRequest,
  ): Promise<void> {
    const command = new UpdatePredictedTimesheetCommand(id, request.user, body);
    await this.commandBus.execute(command);
  }
}
