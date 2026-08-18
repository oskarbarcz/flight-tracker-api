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
  notam?: SimbriefNotam[] | SimbriefNotam;
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
  etops?: {
    entry: Airport;
    exit: Airport;
    suitable_airport?: Airport | Airport[];
  };
  fuel: Fuel;
  fuel_extra: FuelExtra;
  aircraft: Aircraft;
  times: Times;
  weights: Weights;
  text: Text;
  files: Files;
  crew?: Crew;
};
