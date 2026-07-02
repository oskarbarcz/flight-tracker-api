import { Controller, Get } from '@nestjs/common';
import {
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
import { GetParkingPositionResponse } from '../../request/parking-position.dto';
import { ListParkingPositionsByAirportQuery } from '../../../../application/query/parking-position/list-parking-positions-by-airport.query';

@ApiTags('airport parking position')
@Controller('api/v1/airport/:airportId/parking-position')
export class ListParkingPositionsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve all parking positions at given airport' })
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetParkingPositionResponse, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async run(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetParkingPositionResponse[]> {
    const query = new ListParkingPositionsByAirportQuery(airportId);
    return this.queryBus.execute(query);
  }
}
