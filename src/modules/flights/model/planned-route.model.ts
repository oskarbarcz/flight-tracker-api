export type PlannedRouteWindLevel = {
  altitude: number;
  direction: number;
  speed: number;
  oat: number;
};

export type PlannedRouteFuel = {
  flow: number | null;
  leg: number | null;
  used: number | null;
  minimumOnBoard: number | null;
  plannedOnBoard: number | null;
};

export type PlannedRouteWind = {
  direction: number | null;
  speed: number | null;
  levels: PlannedRouteWindLevel[];
};

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
  fuel: PlannedRouteFuel;
  oat: number | null;
  isaDeviation: number | null;
  tropopause: number | null;
  mora: number | null;
  fir: string | null;
  wind: PlannedRouteWind;
};

export type PlannedRoute = {
  route: string | null;
  atcRoute: string | null;
  fixes: PlannedRouteFix[];
};
