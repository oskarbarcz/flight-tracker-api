import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { assertHoldVariantOffered } from '../../model/hold-variant-resolution';

export class AssertHoldVariantOfferedQuery extends Query<void> {
  constructor(
    public readonly airframeType: string,
    public readonly variant: string,
  ) {
    super();
  }
}

@QueryHandler(AssertHoldVariantOfferedQuery)
export class AssertHoldVariantOfferedHandler implements IQueryHandler<AssertHoldVariantOfferedQuery> {
  async execute(query: AssertHoldVariantOfferedQuery): Promise<void> {
    assertHoldVariantOffered(query.airframeType, query.variant);
  }
}
