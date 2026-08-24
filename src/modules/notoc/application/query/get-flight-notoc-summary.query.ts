import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  NotocRepository,
  NotocRow,
} from '../../infra/database/repository/notoc.repository';
import { NotocDocument } from '../../model/notoc.model';
import { FlightNotocSummary } from '../../model/notoc-summary.model';
import { ColdChainRisk } from '../../../cargo/model/cold-chain';
import { NotocStage } from 'prisma/client/client';

export class GetFlightNotocSummariesQuery extends Query<
  Map<string, FlightNotocSummary>
> {
  constructor(public readonly flightIds: string[]) {
    super();
  }
}

@QueryHandler(GetFlightNotocSummariesQuery)
export class GetFlightNotocSummaryHandler implements IQueryHandler<GetFlightNotocSummariesQuery> {
  constructor(private readonly notocRepository: NotocRepository) {}

  async execute(
    query: GetFlightNotocSummariesQuery,
  ): Promise<Map<string, FlightNotocSummary>> {
    const summaries = new Map<string, FlightNotocSummary>();

    if (query.flightIds.length === 0) {
      return summaries;
    }

    const byFlight = new Map<string, NotocRow[]>();

    for (const row of await this.notocRepository.findManyByFlights(
      query.flightIds,
    )) {
      byFlight.set(row.flightId, [...(byFlight.get(row.flightId) ?? []), row]);
    }

    for (const [flightId, rows] of byFlight) {
      summaries.set(flightId, summaryOf(rows));
    }

    return summaries;
  }
}

function summaryOf(rows: NotocRow[]): FlightNotocSummary {
  const preliminary = rows.find((row) => row.stage === NotocStage.preliminary);
  const final = rows.find((row) => row.stage === NotocStage.final);
  const latest = final ?? preliminary;
  const document = latest?.document as unknown as NotocDocument | undefined;

  return {
    dangerousGoodsCount: document?.dangerousGoods.length ?? 0,
    cargoAircraftOnlyCount:
      document?.dangerousGoods.filter((entry) => entry.cargoAircraftOnly)
        .length ?? 0,
    specialLoadCount: document?.specialLoads.length ?? 0,
    worstColdChainRisk: worstRiskOf(document),
    preliminary: stageStateOf(preliminary),
    final: stageStateOf(final),
  };
}

function stageStateOf(row: NotocRow | undefined) {
  return {
    issued: row !== undefined,
    acknowledged: row?.acknowledgedAt != null,
  };
}

const RISK_ORDER = [
  ColdChainRisk.Low,
  ColdChainRisk.Elevated,
  ColdChainRisk.High,
];

function worstRiskOf(
  document: NotocDocument | undefined,
): ColdChainRisk | null {
  const risks = document?.coldChain.map((entry) => entry.risk) ?? [];

  return risks.length === 0
    ? null
    : risks.reduce((worst, risk) =>
        RISK_ORDER.indexOf(risk) > RISK_ORDER.indexOf(worst) ? risk : worst,
      );
}
