import { Module } from '@nestjs/common';
import { WeatherClient, WeatherClientProvider } from './client/weather.client';

@Module({
  providers: [WeatherClientProvider],
  exports: [WeatherClient],
})
export class WeatherModule {}
