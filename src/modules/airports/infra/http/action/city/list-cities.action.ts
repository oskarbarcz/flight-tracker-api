import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { GenericBadRequestResponse } from '../../../../../../core/http/response/bad-request.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { UserRole } from '../../../../../users/model/user-role';
import { ListCitiesQuery } from '../../../../application/query/city/list-cities.query';
import { ListCitiesResponse } from '../../../../model/city.model';
import { ListCitiesFilters } from '../../request/city.dto';

@ApiTags('city')
@Controller('api/v1/city')
export class ListCitiesAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get every city an airport serves',
    description:
      'Answers every city, with whether a postcard exists for it. Pass `hasPostcard=false` for the cities ' +
      'that have none, which are the ones drawing the missing art would give one to.\n\n' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: ListCitiesResponse })
  @ApiBadRequestResponse({ type: GenericBadRequestResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.Operations)
  run(@Query() filters: ListCitiesFilters): Promise<ListCitiesResponse> {
    const query = new ListCitiesQuery(filters.hasPostcard);
    return this.queryBus.execute(query);
  }
}
