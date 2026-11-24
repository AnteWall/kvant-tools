import { describe, expect, it } from 'vitest';

import { expectFixtureReplay, mockFetch, testClient } from '../test-utils/http.js';

const MD = 'cd36c82c-da5f-4a7e-8be5-70d64b6f1853';
const NI = '19fa390b-040f-45a9-8fa2-e7fd34e319ab';

describe('market data replays recorded responses', () => {
  it.each([
    ['market/fixtures/prices.json', (c) => c.market.prices([16102308])],
    ['market/fixtures/series.json', (c) => c.market.series(MD, 'MONTH_1')],
    ['market/fixtures/last-day.json', (c) => c.market.lastDay([MD])],
    ['market/fixtures/search.json', (c) => c.market.search('investor', 3)],
    ['market/fixtures/news.json', (c) => c.market.news(NI)],
    [
      'market/fixtures/article.json',
      (c) => c.market.article('f869a8cb-42a0-4a39-94a1-c0e76f41444f'),
    ],
    ['market/fixtures/exchange-rates.json', (c) => c.market.exchangeRates()],
    ['market/fixtures/indicator.json', (c) => c.market.indicator('omxs30')],
    ['market/fixtures/ratings.json', (c) => c.market.ratings(MD)],
    ['market/fixtures/dividends.json', (c) => c.market.dividends(MD)],
    ['market/fixtures/company-events.json', (c) => c.market.companyEvents(NI)],
    ['market/fixtures/company-profiles.json', (c) => c.market.companyProfiles([NI])],
    ['market/fixtures/key-figures.json', (c) => c.market.keyFigures(MD)],
  ] satisfies [string, Parameters<typeof expectFixtureReplay>[1]][])('%s', (path, call) =>
    expectFixtureReplay(path, call),
  );

  it('asks for a resolution only when given, and nothing for empty id lists', async () => {
    const fetch = mockFetch(() => new Response('{}'));
    const client = testClient(fetch);
    await client.market.series(MD, 'DAY_1', 'MIN_5');
    expect(new URL(fetch.mock.calls.at(-1)![0].toString()).search).toBe('?resolution=MIN_5');
    const calls = fetch.mock.calls.length;
    await expect(client.market.prices([])).resolves.toEqual([]);
    await expect(client.market.lastDay([])).resolves.toEqual([]);
    expect(fetch.mock.calls).toHaveLength(calls);
  });
});
