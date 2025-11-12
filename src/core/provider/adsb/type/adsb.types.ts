export type AdsbPositionReportApiInput = {
  callsign: string;
  date: string;
  latitude: number;
  longitude: number;
  verticalRate?: number;
  squawk?: string;
  groundSpeed?: number;
  track?: number;
  alert?: boolean;
  emergency?: boolean;
  spi?: boolean;
  isOnGround?: boolean;
  altitude?: number;
};

export type AdsbPositionReport = {
  callsign: string;
  date: Date;
  latitude: number;
  longitude: number;
  verticalRate?: number;
  squawk?: string;
  groundSpeed?: number;
  track?: number;
  alert?: boolean;
  emergency?: boolean;
  spi?: boolean;
  isOnGround?: boolean;
  altitude?: number;
};

export type AdsbFlightTrack = AdsbPositionReport[];

export function transformPositionReport(
  input: AdsbPositionReportApiInput,
): AdsbPositionReport {
  return { ...input, date: new Date(input.date) };
}

export function deduplicatePositionReports(
  data: AdsbPositionReport[],
): AdsbPositionReport[] {
  const seen = new Set<string>();

  const deduplicated = data.filter((entry) => {
    const isDuplicate = seen.has(entry.date.toISOString());
    seen.add(entry.date.toISOString());
    return !isDuplicate;
  });

  const sorted = deduplicated.sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return sorted.filter(
    (entry) => !(entry.latitude === 0 && entry.longitude === 0),
  );
}
