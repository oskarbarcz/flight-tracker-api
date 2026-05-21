import { Airframe } from '../model/airframe.model';
import airframesData from './airframes.json';

export const AIRFRAMES: readonly Airframe[] = airframesData as Airframe[];

export function findAirframeByType(type: string): Airframe | undefined {
  return AIRFRAMES.find((airframe) => airframe.type === type);
}
