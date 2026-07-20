import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CACHE_KEYS } from '../../../../../../core/cache/cache.key';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Operator } from '../../../../model/operator.model';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ListAllOperatorsQuery } from '../../../../application/query/list-all-operators.query';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class ListOperatorsAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Retrieve all operators' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: Operator, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEYS.OPERATORS_LIST)
  @Get()
  findAll(): Promise<Operator[]> {
    const query = new ListAllOperatorsQuery();
    return this.queryBus.execute(query);
  }
}
