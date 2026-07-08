type Params = {
  request_id: string;
  sequence_id: string;
};

type General = {
  icao_airline: string;
  flight_number: string;
  is_etops: '0' | '1';
  gc_distance: string;
  total_burn: string;
  cont_rule: string;
};

type Airport = {
  icao_code: string;
};

type Aircraft = {
  reg: string;
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
  params: Params;
  general: General;
  origin: Airport;
  destination: Airport;
  alternate: Airport[];
  enroute_altn?: Airport;
  etops?: {
    entry: Airport;
    exit: Airport;
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
