import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
import { UserRole } from 'prisma/client/client';
import { ReportDiversionRequest } from '../../request/diversion.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { ReportFlightDiversionCommand } from '../../../../application/command/diversion/report-flight-diversion.command';

@ApiTags('flight diversion')
@Controller('api/v1/flight/:flightId/diversion')
export class ReportDiversionAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Report flight diversion',
    description:
      'This action will irreversibly announce flight diversion. <br />' +
      '**NOTE:** This action is only allowed for flights in `taxiing_out` or `in_cruise` status. <br />' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` or `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiBody({ type: ReportDiversionRequest })
  @ApiNoContentResponse({
    description: 'Flight diversion was successfully reported',
  })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async run(
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: ReportDiversionRequest,
  ): Promise<void> {
    const command = new ReportFlightDiversionCommand(
      flightId,
      request.user,
      body,
    );
    await this.commandBus.execute(command);
  }
}
