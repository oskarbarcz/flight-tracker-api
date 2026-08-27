import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetPostcardCatalogueResponse } from '../../../../model/postcard/postcard.model';
import { GetPostcardCatalogueQuery } from '../../../../application/query/postcard/get-postcard-catalogue.query';
import { UnauthorizedResponse } from '../../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../../../users/model/user-role';

@ApiTags('postcard')
@Controller('api/v1/postcard')
export class GetPostcardCatalogueAction {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get every postcard and its art',
    description:
      'Answers every postcard regardless of who holds it, so unsuitable art can be spotted and replaced.\n\n' +
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({ type: GetPostcardCatalogueResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @Get()
  @Role(UserRole.Operations)
  run(): Promise<GetPostcardCatalogueResponse> {
    const query = new GetPostcardCatalogueQuery();
    return this.queryBus.execute(query);
  }
}
