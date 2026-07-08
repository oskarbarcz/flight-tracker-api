import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { GetAirportWeatherResponse } from '../../../../model/airport-weather.model';
import { GetAirportWeatherQuery } from '../../../../application/query/weather/get-airport-weather.query';

@ApiTags('airport weather')
@Controller('api/v1/airport/:airportId/weather')
export class GetWeatherAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve latest weather for an airport' })
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetAirportWeatherResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async run(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetAirportWeatherResponse> {
    const query = new GetAirportWeatherQuery(airportId);
    return this.queryBus.execute(query);
  }
}
