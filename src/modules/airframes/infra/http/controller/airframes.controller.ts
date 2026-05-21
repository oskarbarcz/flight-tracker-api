import { Controller, Get, Param } from '@nestjs/common';
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
import { Airframe } from '../../../model/airframe.model';
import { ListAllAirframesQuery } from '../../../application/query/list-all-airframes.query';
import { GetAirframeByTypeQuery } from '../../../application/query/get-airframe-by-type.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';

@ApiTags('airframe')
@Controller('api/v1/airframe')
export class AirframesController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all supported airframes' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Airframe, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @Get()
  async findAll(): Promise<Airframe[]> {
    const query = new ListAllAirframesQuery();
    return this.queryBus.execute(query);
  }

  @ApiOperation({ summary: 'Retrieve one airframe by its ICAO type code' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'type',
    description: 'ICAO aircraft type designator (4-letter code)',
    example: 'B77W',
  })
  @ApiOkResponse({ type: Airframe })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get(':type')
  async findOne(@Param('type') type: string): Promise<Airframe> {
    const query = new GetAirframeByTypeQuery(type);
    return this.queryBus.execute(query);
  }
}
