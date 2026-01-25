type General = {
  icao_airline: string;
  flight_number: string;
};

type Airport = {
  icao_code: string;
};

type Aircraft = {
  icao_code: string;
  reg: string;
};

export type Times = {
  sched_out: string;
  sched_off: string;
  sched_on: string;
  sched_in: string;
  est_out: string;
  est_off: string;
  est_on: string;
  est_in: string;
};

export type Weights = {
  cargo: string;
  payload: string;
  est_zfw: string;
  pax_count: string;
};

export type Files = {
  directory: string;
  pdf: {
    link: string;
  };
};

export type OperationalFlightPlan = {
  general: General;
  origin: Airport;
  destination: Airport;
  alternate: Airport[];
  enroute_altn: Airport[];
  etops: {
    entry: Airport;
    exit: Airport;
  };
  aircraft: Aircraft;
  times: Times;
  weights: Weights;
  files: Files;
};
