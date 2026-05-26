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
import { UserRole } from 'prisma/client/client';
import { UpdateDiversionRequest } from '../../request/diversion.dto';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { UpdateFlightDiversionCommand } from '../../../../application/command/diversion/update-flight-diversion.command';

@ApiTags('flight diversion')
@Controller('api/v1/flight/:flightId/diversion')
export class UpdateDiversionAction {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update flight diversion',
    description:
      'Amend a previously reported diversion while the flight is still in `taxiing_out` or `in_cruise`. Once the aircraft begins its arrival sequence at the diverted airport the record becomes immutable history.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'flightId',
    description: 'Flight unique identifier',
  })
  @ApiBody({ type: UpdateDiversionRequest })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Patch()
  @Role(UserRole.CabinCrew, UserRole.Operations)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async run(
    @UuidParam('flightId') flightId: string,
    @Req() request: AuthorizedRequest,
    @Body() body: UpdateDiversionRequest,
  ): Promise<void> {
    const command = new UpdateFlightDiversionCommand(
      flightId,
      request.user,
      body,
    );
    await this.commandBus.execute(command);
  }
}
