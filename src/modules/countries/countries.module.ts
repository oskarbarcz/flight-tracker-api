import { Module } from '@nestjs/common';
import { ListCountriesAction } from './infra/http/action/list-countries.action';
import { ListCountriesHandler } from './application/query/list-countries.query';

@Module({
  controllers: [ListCountriesAction],
  providers: [ListCountriesHandler],
})
export class CountriesModule {}
