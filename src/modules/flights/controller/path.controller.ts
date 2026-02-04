import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UuidParam } from '../../../core/validation/uuid.param';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { FlightPathElement, FlightTracking } from '../entity/flight.entity';
import { SkipAuth } from '../../../core/http/auth/decorator/skip-auth.decorator';
import { AuthorizedRequest } from '../../../core/http/request/authorized.request';
import { QueryBus } from '@nestjs/cqrs';
import { GetFlightPathQuery } from '../application/query/get-flight-path.query';
import { FlightDoesNotExistError } from '../dto/errors.dto';
import { GetFlightTrackingQuery } from '../application/query/get-flight-tracking.query';

@ApiTags('flight path')
@Controller('api/v1/flight')
export class PathController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve flight path' })
  @ApiParam({
    name: 'id',
    description: 'Flight unique identifier',
  })
  @ApiOkResponse({ type: FlightPathElement, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get('/:id/path')
  @SkipAuth()
  async getFlightPath(
    @Req() request: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<FlightPathElement[]> {
    const tracking = await this.queryBus.execute(
      new GetFlightTrackingQuery(id),
    );

    if (!tracking) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (!request.user && tracking === FlightTracking.Private) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    const query = new GetFlightPathQuery(id);
    return this.queryBus.execute(query);
  }
}
