import { EtopsAirportSnapshot, EtopsPointSnapshot } from './etops.model';
import { FlightOceanicCrossing } from './oceanic.model';
import { PlannedRoute } from './planned-route.model';

export type EtopsPlan = {
  ruleMinutes: number | null;
  ruleRadiusNm: number | null;
  thresholdMinutes: number | null;
  thresholdRadiusNm: number | null;
  points: EtopsPointSnapshot[];
  airports: EtopsAirportSnapshot[];
};

export type EtopsBriefing = {
  etops: EtopsPlan | null;
  route: PlannedRoute;
  oceanicCrossing: FlightOceanicCrossing;
};
