import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
import { UserRole } from 'prisma/client/client';
import { RejectDelayReportRequest } from '../../request/delay.dto';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { RejectDelayReportCommand } from '../../../../application/command/delay/reject-delay-report.command';

@ApiTags('flight delay')
@Controller('api/v1/flight/:flightId/delay/:reportId/reject')
export class RejectDelayReportAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Reject a delay allocation report',
    description:
      'Operations sends a coded delay report back to the cabin crew to amend or remove. A rejected report keeps the flight from being closed until it is replaced. ' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiParam({
    name: 'reportId',
    description: 'Delay allocation report identifier',
  })
  @ApiBody({ type: RejectDelayReportRequest })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @ApiConflictResponse({
    description: 'The report has already been accepted and is frozen.',
  })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  public async run(
    @UuidParam('flightId') flightId: string,
    @UuidParam('reportId') reportId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: RejectDelayReportRequest,
  ): Promise<void> {
    await this.commandBus.execute(
      new RejectDelayReportCommand(
        flightId,
        reportId,
        request.user,
        body.rejectionReason,
      ),
    );
  }
}
