import { Schedule } from '../entity/timesheet.entity';
import { Loadsheet } from '../entity/loadsheet.entity';

/**
 * Request object for updating scheduled timesheet
 */
export interface UpdateScheduledTimesheetRequest {
  flightId: string;
  schedule: Schedule;
  initiatorId: string;
}

/**
 * Request object for updating preliminary loadsheet
 */
export interface UpdatePreliminaryLoadsheetRequest {
  flightId: string;
  loadsheet: Loadsheet;
  initiatorId: string;
}

/**
 * Request object for pilot check-in
 */
export interface CheckInPilotRequest {
  flightId: string;
  estimatedSchedule: Schedule;
  initiatorId: string;
}

/**
 * Request object for finishing boarding
 */
export interface FinishBoardingRequest {
  flightId: string;
  finalLoadsheet: Loadsheet;
  initiatorId: string;
}

/**
 * Request object for flight actions that only need flight ID and initiator
 */
export interface FlightActionRequest {
  flightId: string;
  initiatorId: string;
}