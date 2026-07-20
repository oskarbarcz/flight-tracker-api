import { Controller, Get } from '@nestjs/common';
import {
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
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { GetTerminalResponse } from '../../request/terminal.dto';
import { ListTerminalsByAirportQuery } from '../../../../application/query/terminal/list-terminals-by-airport.query';

@ApiTags('airport terminal')
@Controller('api/v1/airport/:airportId/terminal')
export class ListTerminalsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all terminals at given airport' })
  @ApiBearerAuth('jwt')
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetTerminalResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async run(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetTerminalResponse[]> {
    const query = new ListTerminalsByAirportQuery(airportId);
    return this.queryBus.execute(query);
  }
}
