export enum WeatherReportKind {
  Metar = 'metar',
  Taf = 'taf',
}

export type WeatherReportsByIcao = Map<string, string>;
