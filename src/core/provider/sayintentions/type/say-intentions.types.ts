export type SayIntentionsFrequency = {
  freq: string;
  type: string;
  callsign: string | null;
};

export type SayIntentionsWeatherPayload = {
  metar?: string | null;
  taf?: string | null;
  atis?: string | null;
  comms?: SayIntentionsFrequency[];
};

export type SayIntentionsWeather = {
  metar?: string;
  taf?: string;
  atis?: string;
};
