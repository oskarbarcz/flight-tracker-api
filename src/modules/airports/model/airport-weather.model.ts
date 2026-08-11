import { ApiProperty } from '@nestjs/swagger';

export enum WeatherSource {
  AviationWeatherGov = 'aviation_weather_gov',
  SayIntentions = 'say_intentions',
}

export enum WeatherInformationType {
  Atis = 'atis',
  Metar = 'metar',
  Taf = 'taf',
}

export class GetAirportWeatherResponse {
  @ApiProperty({
    description: 'Report unique identifier',
    example: '9d1f4c6a-70b6-4a3e-8a4b-4c2d2f8e6b11',
  })
  id!: string;

  @ApiProperty({
    description: 'Provider that published the report',
    example: WeatherSource.AviationWeatherGov,
    enum: WeatherSource,
  })
  source!: WeatherSource;

  @ApiProperty({
    description:
      'Kind of report. ATIS is published by SayIntentions only; aviationweather.gov provides METAR and TAF.',
    example: WeatherInformationType.Metar,
    enum: WeatherInformationType,
  })
  informationType!: WeatherInformationType;

  @ApiProperty({
    description:
      'Report exactly as the provider returned it. Coded text for METAR and TAF, spoken text for ATIS. Providers format the same report differently — SayIntentions omits the leading METAR token that aviationweather.gov includes.',
    example: 'METAR EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG',
  })
  content!: string;

  @ApiProperty({
    description: 'When the system last fetched the report from its provider',
    example: '2026-08-10T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  lastFetched!: Date;
}
