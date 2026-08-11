import { IsEnum, IsOptional } from 'class-validator';
import { WeatherSource } from '../../../model/airport-weather.model';

export enum WeatherSourceFilter {
  UserDefault = 'user_default',
  All = 'all',
  AviationWeatherGov = WeatherSource.AviationWeatherGov,
  SayIntentions = WeatherSource.SayIntentions,
}

export class GetWeatherFilters {
  @IsOptional()
  @IsEnum(WeatherSourceFilter)
  source: WeatherSourceFilter = WeatherSourceFilter.UserDefault;
}
