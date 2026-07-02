import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { GetParkingPositionResponse } from '../../request/parking-position.dto';
import { GetParkingPositionByIdQuery } from '../../../../application/query/parking-position/get-parking-position-by-id.query';

@ApiTags('airport parking position')
@Controller('api/v1/airport/:airportId/parking-position')
export class GetParkingPositionAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Retrieve one parking position' })
  @ApiParam({ name: 'airportId', description: 'Airport unique identifier' })
  @ApiParam({
    name: 'parkingPositionId',
    description: 'Parking position unique identifier',
  })
  @ApiOkResponse({ type: GetParkingPositionResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @SkipAuth()
  @Get(':parkingPositionId')
  async run(
    @UuidParam('airportId') airportId: string,
    @UuidParam('parkingPositionId') parkingPositionId: string,
  ): Promise<GetParkingPositionResponse> {
    const query = new GetParkingPositionByIdQuery(airportId, parkingPositionId);
    return this.queryBus.execute(query);
  }
}
