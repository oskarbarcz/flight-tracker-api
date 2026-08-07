import {
  ListRecentOperatorsHandler,
  ListRecentOperatorsQuery,
  RECENT_OPERATORS_LIMIT,
} from './list-recent-operators.query';

const USER_ID = 'd3f6c1a4-9b52-4c7e-8f01-2a6de4b7c910';

describe('ListRecentOperatorsHandler', () => {
  let repository: { findRecentlyInvolvedWith: jest.Mock };
  let handler: ListRecentOperatorsHandler;

  beforeEach(() => {
    repository = {
      findRecentlyInvolvedWith: jest.fn().mockResolvedValue([]),
    };
    handler = new ListRecentOperatorsHandler(repository as never);
  });

  it('asks the repository for the caller carriers, capped at four', async () => {
    await handler.execute(new ListRecentOperatorsQuery(USER_ID));

    expect(repository.findRecentlyInvolvedWith).toHaveBeenCalledWith(
      USER_ID,
      4,
    );
    expect(RECENT_OPERATORS_LIMIT).toBe(4);
  });

  it('passes the repository result through unchanged', async () => {
    const operators = [{ icaoCode: 'KLM' }, { icaoCode: 'ICE' }];
    repository.findRecentlyInvolvedWith.mockResolvedValue(operators);

    await expect(
      handler.execute(new ListRecentOperatorsQuery(USER_ID)),
    ).resolves.toBe(operators);
  });
});
