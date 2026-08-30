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
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../../core/http/response/not-found.response';
import { UuidParam } from '../../../../../../core/validation/uuid.param';
import { SkipAuth } from '../../../../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../../../../core/http/request/authorized.request';
import { FlightTracking } from '../../../../model/flight.model';
import { FlightDoesNotExistError } from '../../../../model/error/flight.error';
import {
  FlightLoadsheet,
  LoadsheetKind,
} from '../../../../model/loadsheet.model';
import { GetFlightTrackingQuery } from '../../../../application/query/get-flight-tracking.query';
import { ListFlightLoadsheetsQuery } from '../../../../application/query/list-flight-loadsheets.query';
import { LoadsheetListFilters } from '../../request/loadsheet.dto';

@ApiTags('flight')
@Controller('api/v1/flight')
export class ListFlightLoadsheetsAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'List flight loadsheets',
    description:
      'Returns the flight loadsheets in the order they were issued: the preliminary revisions ' +
      'oldest first, then the final loadsheet where one exists. <br />' +
      '**NOTE:** A flight that was never given a loadsheet reports an empty list.',
  })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: LoadsheetKind,
    description:
      'Kind of loadsheet to report. Omitted, every loadsheet the flight carries is reported.',
  })
  @ApiOkResponse({ type: [FlightLoadsheet] })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/:id/loadsheet')
  @SkipAuth()
  async run(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
    @Query() filters: LoadsheetListFilters,
  ): Promise<FlightLoadsheet[]> {
    const trackingQuery = new GetFlightTrackingQuery(id);
    const tracking = await this.queryBus.execute(trackingQuery);

    if (!tracking) {
      throw new FlightDoesNotExistError();
    }

    if (!request.user && tracking === FlightTracking.Disabled) {
      throw new FlightDoesNotExistError();
    }

    const query = new ListFlightLoadsheetsQuery(id, filters.type);
    return this.queryBus.execute(query);
  }
}
