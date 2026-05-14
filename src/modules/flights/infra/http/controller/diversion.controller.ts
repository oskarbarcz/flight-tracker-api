import {
  ReportDiversionRequest,
  GetDiversionResponse,
} from '../request/diversion.dto';
import {
  Body,
  Controller,
  Get,
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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from 'prisma/client/client';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ReportFlightDiversionCommand } from '../../../application/command/diversion/report-flight-diversion.command';
import { GetDiversionQuery } from '../../../application/query/diversion/get-diversion.query';

@ApiTags('flight diversion')
@Controller('api/v1/flight/:flightId/diversion')
export class DiversionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
  public async report(
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

  @ApiOperation({
    summary: 'Get flight diversion details',
    description:
      '**NOTE:** This endpoint is only available for users with `cabin crew` or `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: GetDiversionResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  public async get(
    @UuidParam('flightId') flightId: string,
  ): Promise<GetDiversionResponse> {
    const query = new GetDiversionQuery(flightId);
    return this.queryBus.execute(query);
  }
}
