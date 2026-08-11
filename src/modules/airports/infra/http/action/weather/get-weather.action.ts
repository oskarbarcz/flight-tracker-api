import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { GetAirportWeatherResponse } from '../../../../model/airport-weather.model';
import {
  GetWeatherFilters,
  WeatherSourceFilter,
} from '../../request/weather.dto';
import { GetAirportWeatherQuery } from '../../../../application/query/weather/get-airport-weather.query';

@ApiTags('airport weather')
@Controller('api/v1/airport/:airportId/weather')
export class GetWeatherAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve stored weather reports for an airport',
    description:
      "Returns the airport's reports, ordered by source and then information type. " +
      "Without a `source` filter the caller's own default weather source is used; " +
      'a request that carries no access token falls back to `aviation_weather_gov`. ' +
      'An airport with no matching report returns an empty collection.',
  })
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiQuery({
    name: 'source',
    description: 'Filter reports by the provider that published them',
    type: 'string',
    enum: WeatherSourceFilter,
    default: WeatherSourceFilter.UserDefault,
    required: false,
  })
  @ApiOkResponse({ type: GetAirportWeatherResponse, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('airportId') airportId: string,
    @Query() filters: GetWeatherFilters,
  ): Promise<GetAirportWeatherResponse[]> {
    const query = new GetAirportWeatherQuery(
      airportId,
      filters.source,
      request.user?.sub,
    );

    return this.queryBus.execute(query);
  }
}
