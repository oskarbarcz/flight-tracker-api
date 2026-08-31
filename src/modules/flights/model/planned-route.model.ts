export type PlannedRouteFix = {
  ordinal: number;
  ident: string;
  latitude: number;
  longitude: number;
  altitude: number;
  elapsedSeconds: number;
  distanceNm: number | null;
  trackTrue: number | null;
  trackMag: number | null;
  viaAirway: string | null;
  stage: string;
};

export type PlannedRoute = {
  route: string | null;
  fixes: PlannedRouteFix[];
};
