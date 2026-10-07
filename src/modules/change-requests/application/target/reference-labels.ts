import { QueryBus } from '@nestjs/cqrs';
import { FindTerminalQuery } from '../../../airports/application/query/terminal/find-terminal.query';
import { FindParkingPositionQuery } from '../../../airports/application/query/parking-position/find-parking-position.query';
import { nullWhenNotFound } from './target-summary';

export async function terminalShortName(
  queryBus: QueryBus,
  terminalId: string,
): Promise<string | null> {
  const query = new FindTerminalQuery(terminalId);
  const terminal = await nullWhenNotFound(queryBus.execute(query));

  return terminal?.shortName ?? null;
}

export async function parkingPositionName(
  queryBus: QueryBus,
  parkingPositionId: string,
): Promise<string | null> {
  const query = new FindParkingPositionQuery(parkingPositionId);
  const parkingPosition = await nullWhenNotFound(queryBus.execute(query));

  return parkingPosition?.name ?? null;
}
