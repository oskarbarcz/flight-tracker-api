type Params = {
  request_id: string;
  sequence_id: string;
  time_generated?: string;
};

export type Fetch = {
  userid?: string;
  status?: string;
};

type General = {
  icao_airline: string;
  flight_number: string;
  is_etops: '0' | '1';
  gc_distance: string;
  total_burn: string;
  cont_rule: string;
  route?: string | EmptyElement;
};

export type EmptyElement = Record<string, never>;

export type SimbriefNotam = {
  notam_id: string;
  location_icao: string;
  location_type: string;
  date_created: string;
  date_effective: string;
  date_expire?: string | EmptyElement;
  date_modified: string;
  notam_html: string | EmptyElement;
  notam_text: string | EmptyElement;
  notam_raw: string | EmptyElement;
  notam_nrc: string | EmptyElement;
  notam_qcode: string | EmptyElement;
  notam_qcode_category: string | EmptyElement;
  notam_qcode_subject: string | EmptyElement;
  notam_qcode_status: string | EmptyElement;
};

type Airport = {
  icao_code: string;
  iata_code?: string | EmptyElement;
  name?: string | EmptyElement;
  plan_rwy?: string;
  pos_lat?: string | EmptyElement;
  pos_long?: string | EmptyElement;
  elevation?: string | EmptyElement;
  notam?: SimbriefNotam[] | SimbriefNotam;
};

export type EtopsSuitableAirport = Airport & {
  pos_lat?: string;
  pos_long?: string;
  elevation?: string;
  trans_alt?: string;
  trans_level?: string;
  fcst_cig?: string;
  fcst_vis?: string;
  suitability_start?: string;
  suitability_end?: string;
};

export type EtopsDiversionAirport = {
  icao_code: string;
  track_true?: string;
  track_mag?: string;
  distance?: string;
  avg_wind_comp?: string;
  avg_temp_dev?: string;
  est_fob?: string;
};

type EtopsPointFuel = {
  elapsed_time?: string;
  min_fob?: string;
  est_fob?: string;
  etops_condition?: string;
  div_time?: string;
  div_burn?: string;
  critical_fuel?: string;
  div_altitude?: string;
};

export type EtopsThresholdPoint = EtopsPointFuel & {
  icao_code: string;
  iata_code?: string | EmptyElement;
  icao_region?: string | EmptyElement;
  notam?: SimbriefNotam[] | SimbriefNotam;
  pos_lat_fix?: string;
  pos_long_fix?: string;
  pos_lat_apt?: string;
  pos_long_apt?: string;
  div_airport?: EtopsDiversionAirport;
};

export type EtopsEqualTimePoint = EtopsPointFuel & {
  pos_lat?: string;
  pos_long?: string;
  div_airport?: EtopsDiversionAirport[] | EtopsDiversionAirport;
};

export type EtopsCriticalPoint = {
  fix_type?: string;
  pos_lat?: string;
  pos_long?: string;
  elapsed_time?: string;
  est_fob?: string;
  critical_fuel?: string;
};

export type Etops = {
  rule?: string;
  entry: EtopsThresholdPoint;
  exit: EtopsThresholdPoint;
  equal_time_point?: EtopsEqualTimePoint[] | EtopsEqualTimePoint;
  critical_point?: EtopsCriticalPoint;
  suitable_airport?: EtopsSuitableAirport[] | EtopsSuitableAirport;
};

export type NavlogFix = {
  ident: string;
  type?: string | EmptyElement;
  icao_region?: string | EmptyElement;
  frequency?: string | EmptyElement;
  pos_lat?: string;
  pos_long?: string;
  altitude_feet?: string;
  distance?: string | EmptyElement;
  track_true?: string | EmptyElement;
  track_mag?: string | EmptyElement;
  time_total?: string;
  via_airway?: string | EmptyElement;
  stage?: string | EmptyElement;
};

export type Navlog = {
  fix?: NavlogFix[] | NavlogFix;
};

export type AlternateNavlog = {
  icao_code?: string | EmptyElement;
  fix?: NavlogFix[] | NavlogFix;
};

export type OceanicTrackFix = {
  ident: string;
  pos_lat?: string;
  pos_long?: string;
};

export type OceanicTrack = {
  id: string;
  group?: string | EmptyElement;
  tmi?: string | EmptyElement;
  addr?: string | EmptyElement;
  route?: string | EmptyElement;
  levels?: string | EmptyElement;
  start?: string;
  end?: string;
  fixes?: { fix?: OceanicTrackFix[] | OceanicTrackFix } | EmptyElement;
};

export type Tracks = {
  nat?: OceanicTrack[] | OceanicTrack;
  nat_notams?: Record<string, string> | EmptyElement;
};

export type Atc = {
  fir_etops?: string[] | string | EmptyElement;
  route?: string | EmptyElement;
};

export type RouteMapData = {
  etopsRule?: number;
  etopsRuleDistance?: number;
  etopsThresholdMinutes?: number;
  tracksDirection?: string;
};

type Aircraft = {
  reg: string;
  icaocode?: string | EmptyElement;
  name?: string | EmptyElement;
};

export type Times = {
  sched_out: string;
  sched_off: string;
  sched_on: string;
  sched_in: string;
};

export type Fuel = {
  plan_ramp: string;
  taxi: string;
  enroute_burn: string;
  contingency: string;
  alternate_burn: string;
  reserve: string;
  etops: string;
  min_takeoff: string;
  plan_takeoff: string;
  plan_landing: string;
  avg_fuel_flow: string;
  max_tanks: string;
};

export type FuelExtraBucket = {
  label: string;
  fuel: string;
  time: string;
};

export type FuelExtra = {
  bucket: FuelExtraBucket[];
};

export type Weights = {
  cargo: string;
  payload: string;
  est_zfw: string;
  pax_count: string;
};

export type Text = {
  tlr_section: string;
  plan_html: string;
};

export type Files = {
  directory: string;
  pdf: {
    link: string;
  };
};

export type Crew = {
  pilot_id: string;
  cpt: string;
  fo: string;
  dx: string;
  pu: string;
  fa: string[];
};

export type OperationalFlightPlan = {
  fetch?: Fetch;
  params: Params;
  general: General;
  origin: Airport;
  destination: Airport;
  alternate: Airport[];
  takeoff_altn?: Airport | Airport[];
  enroute_altn?: Airport;
  enroute_station?: Airport[];
  etops?: Etops;
  navlog?: Navlog;
  alternate_navlog?: AlternateNavlog[] | AlternateNavlog;
  tracks?: Tracks;
  atc?: Atc;
  map_data?: string | EmptyElement;
  fuel: Fuel;
  fuel_extra: FuelExtra;
  aircraft: Aircraft;
  times: Times;
  weights: Weights;
  text: Text;
  files: Files;
  crew?: Crew;
};
