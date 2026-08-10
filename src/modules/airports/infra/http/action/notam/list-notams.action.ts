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
import { GetAirportNotamResponse } from '../../../../model/airport-notam.model';
import { ListAirportNotamsQuery } from '../../../../application/query/notam/list-airport-notams.query';

@ApiTags('airport notam')
@Controller('api/v1/airport/:airportId/notam')
export class ListNotamsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve NOTAMs currently in force at an airport',
    description:
      'Returns the NOTAMs in force at the airport: those with no expiry and those expiring in the future, newest effective first. Expired NOTAMs are omitted.',
  })
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiOkResponse({ type: GetAirportNotamResponse, isArray: true })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get()
  async run(
    @UuidParam('airportId') airportId: string,
  ): Promise<GetAirportNotamResponse[]> {
    const query = new ListAirportNotamsQuery(airportId);
    return this.queryBus.execute(query);
  }
}
