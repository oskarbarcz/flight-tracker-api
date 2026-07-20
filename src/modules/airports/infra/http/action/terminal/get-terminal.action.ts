import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GetTerminalResponse } from '../../request/terminal.dto';
import { GetTerminalByIdQuery } from '../../../../application/query/terminal/get-terminal-by-id.query';

@ApiTags('airport terminal')
@Controller('api/v1/airport/:airportId/terminal')
export class GetTerminalAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one terminal' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({ name: 'terminalId', description: 'Terminal unique identifier' })
  @ApiOkResponse({ type: GetTerminalResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get(':terminalId')
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('terminalId') terminalId: string,
  ): Promise<GetTerminalResponse> {
    const query = new GetTerminalByIdQuery(airportId, terminalId);
    return this.queryBus.execute(query);
  }
}
