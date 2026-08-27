import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { PostcardModule } from '../../core/provider/postcard/postcard.module';
import { PostcardsRepository } from './infra/database/postcard/postcards.repository';
import { UserPostcardsRepository } from './infra/database/postcard/user-postcards.repository';
import { GeneratePostcardHandler } from './application/command/postcard/generate-postcard.command';
import { AwardPostcardHandler } from './application/command/postcard/award-postcard.command';
import { AcknowledgePostcardHandler } from './application/command/postcard/acknowledge-postcard.command';
import { RedrawPostcardHandler } from './application/command/postcard/redraw-postcard.command';
import { ConfirmDrawnPostcardsHandler } from './application/command/postcard/confirm-drawn-postcards.command';
import { DrawMissingPostcardsHandler } from './application/command/postcard/draw-missing-postcards.command';
import { GetMyPostcardsHandler } from './application/query/postcard/get-my-postcards.query';
import { GetMyPostcardHandler } from './application/query/postcard/get-my-postcard.query';
import { GetPostcardCatalogueHandler } from './application/query/postcard/get-postcard-catalogue.query';
import { GetCityIdsWithPostcardHandler } from './application/query/postcard/get-city-ids-with-postcard.query';
import { CityCreatedListener } from './application/event/city-created.listener';
import { CityRenamedListener } from './application/event/city-renamed.listener';
import { PostcardConfirmationService } from './infra/service/postcard-confirmation.service';
import { GetMyPostcardsAction } from './infra/http/action/postcard/get-my-postcards.action';
import { GetMyPostcardAction } from './infra/http/action/postcard/get-my-postcard.action';
import { AcknowledgePostcardAction } from './infra/http/action/postcard/acknowledge-postcard.action';
import { GetPostcardCatalogueAction } from './infra/http/action/postcard/get-postcard-catalogue.action';
import { RedrawPostcardAction } from './infra/http/action/postcard/redraw-postcard.action';
import { DrawMissingPostcardsAction } from './infra/http/action/postcard/draw-missing-postcards.action';

@Module({
  imports: [PrismaModule, PostcardModule],
  controllers: [
    GetMyPostcardsAction,
    GetMyPostcardAction,
    AcknowledgePostcardAction,
    GetPostcardCatalogueAction,
    RedrawPostcardAction,
    DrawMissingPostcardsAction,
  ],
  providers: [
    PostcardsRepository,
    UserPostcardsRepository,
    GeneratePostcardHandler,
    AwardPostcardHandler,
    AcknowledgePostcardHandler,
    RedrawPostcardHandler,
    DrawMissingPostcardsHandler,
    ConfirmDrawnPostcardsHandler,
    GetMyPostcardsHandler,
    GetMyPostcardHandler,
    GetPostcardCatalogueHandler,
    GetCityIdsWithPostcardHandler,
    CityCreatedListener,
    CityRenamedListener,
    PostcardConfirmationService,
  ],
})
export class GameModule {}
