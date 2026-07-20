import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Airframe } from '../../../model/airframe.model';
import { ListAllAirframesQuery } from '../../../application/query/list-all-airframes.query';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';

@ApiTags('airframe')
@Controller('api/v1/airframe')
export class ListAllAirframesAction {
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
}
