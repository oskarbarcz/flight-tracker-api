import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { SkyLinkClient } from '../../core/provider/skylink/client/skylink.client';
import { Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Role } from '../../core/http/auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';
import { AirportResponse } from './dto/airport.dto';
import { UnauthorizedResponse } from '../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../core/http/response/forbidden.response';
import { GenericNotFoundResponse } from '../../core/http/response/not-found.response';

@ApiTags('skylink')
@Controller('api/v1/skylink')
@UseInterceptors(CacheInterceptor)
export class SkyLinkController {
  constructor(private readonly client: SkyLinkClient) {}

  @ApiOperation({
    summary: 'Get information about airport from SkyLink by IATA code',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: AirportResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: GenericNotFoundResponse })
  @Get('/airport/:iataCode')
  @Role(UserRole.Operations)
  @CacheTTL(60 * 60) // 60 minutes
  getAirportByIataCode(@Param('iataCode') iataCode: string): Promise<any> {
    return this.client.getAirportByIataCode(iataCode);
  }
}
