export type AdsbPositionReportApiInput = {
  callsign: string;
  date: string;
  latitude: number;
  longitude: number;
};

export type AdsbPositionReport = {
  callsign: string;
  date: Date;
  latitude: number;
  longitude: number;
};

export type AdsbFlightTrack = AdsbPositionReport[];

export function transformPositionReport(
  input: AdsbPositionReportApiInput,
): AdsbPositionReport {
  return {
    callsign: input.callsign,
    date: new Date(input.date),
    latitude: input.latitude,
    longitude: input.longitude,
  };
}
