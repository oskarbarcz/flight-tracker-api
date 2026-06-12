import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRole } from 'prisma/client/client';
import {
  ReportDelayRequest,
  GetDelayRequestResponse,
} from '../../request/delay.dto';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { ReportDelayCommand } from '../../../../application/command/delay/report-delay.command';
import { GetDelayRequestQuery } from '../../../../application/query/delay/get-delay-request.query';

@ApiTags('flight delay')
@Controller('api/v1/flight/:flightId/delay')
export class ReportDelayAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'File a delay allocation report',
    description:
      'Adds one coded delay report to the flight delay request. ' +
      '**NOTE:** This endpoint is only available for users with `cabin crew` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'flightId', description: 'Flight unique identifier' })
  @ApiBody({ type: ReportDelayRequest })
  @ApiCreatedResponse({ type: GetDelayRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Post()
  @Role(UserRole.CabinCrew)
  public async run(
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: ReportDelayRequest,
  ): Promise<GetDelayRequestResponse> {
    await this.commandBus.execute(
      new ReportDelayCommand(flightId, request.user, body),
    );
    return this.queryBus.execute(new GetDelayRequestQuery(flightId));
  }
}
