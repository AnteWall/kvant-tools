import { describe, expect, it } from 'vitest';

import { expectFixtureReplay, mockFetch, testClient } from './test-utils/http.js';

const ACC = '00000000-0000-4000-8000-000000000001';

describe('endpoints replay recorded responses', () => {
  it.each([
    ['accounts/fixtures/accounts-list.json', (c) => c.accounts.list()],
    ['accounts/fixtures/account-info.json', (c) => c.accounts.info([1])],
    ['positions/fixtures/positions-empty.json', (c) => c.positions.list([ACC])],
    ['positions/fixtures/positions.json', (c) => c.positions.list([ACC])],
    ['positions/fixtures/own-capital.json', (c) => c.positions.ownCapital([ACC])],
    [
      'performance/fixtures/graph.json',
      (c) => c.performance.graph([ACC], { fromDate: '2026-01-01', toDate: '2026-01-04' }),
    ],
    ['performance/fixtures/development.json', (c) => c.performance.development([ACC], 'YEAR_1')],
    ['performance/fixtures/risk-metrics.json', (c) => c.performance.riskMetrics([ACC])],
    ['performance/fixtures/returns-by-year.json', (c) => c.performance.returnsByYear([ACC])],
    [
      'transactions/fixtures/transactions.json',
      (c) =>
        c.transactions.page({ accountIds: [ACC], fromDate: '2026-01-01', toDate: '2026-01-31' }),
    ],
    ['watchlists/fixtures/watchlists.json', (c) => c.watchlists.list()],
    ['alerts/fixtures/price-alarms.json', (c) => c.alerts.priceAlarms()],
    ['instruments/fixtures/instrument.json', (c) => c.instruments.get([16099874])],
    [
      'instruments/fixtures/instrument-by-isin.json',
      (c) => c.instruments.byIsin('SE0015811963', 'SEK', 11),
    ],
  ] satisfies [string, Parameters<typeof expectFixtureReplay>[1]][])('%s', (path, call) =>
    expectFixtureReplay(path, call),
  );

  it('sorts account ids the way nordnet.se does', async () => {
    const fetch = mockFetch(() => new Response('{}'));
    await testClient(fetch).positions.list(['b', 'a']);
    expect(JSON.parse(String(fetch.mock.calls.at(-1)![1]?.body))).toEqual({
      accountIds: ['a', 'b'],
    });
  });

  it('pages transactions newest first by accounting date', async () => {
    const fetch = mockFetch(() => new Response('[]'));
    await expect(
      testClient(fetch).transactions.page({
        accountIds: [ACC],
        fromDate: '2000-01-01',
        toDate: '2026-01-01',
      }),
    ).resolves.toEqual([]);
    const [url, init] = fetch.mock.calls.at(-1)!;
    expect(new URL(url.toString()).pathname).toBe(
      '/transaction/transaction-and-notes/v2/transactions/page',
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      accountIds: [ACC],
      fromDate: '2000-01-01',
      includeCancellations: false,
      limit: 50,
      offset: 0,
      sort: 'ACCOUNTING_DATE',
      sortOrder: 'DESC',
      toDate: '2026-01-01',
    });
  });

  it('reads an empty (204) order or trade list as an empty array', async () => {
    const fetch = mockFetch(() => new Response(null, { status: 204 }));
    const client = testClient(fetch);
    await expect(client.orders.list({ deleted: true })).resolves.toEqual([]);
    await expect(client.orders.trades()).resolves.toEqual([]);
    expect(fetch.mock.calls[0]![0].toString()).toBe(
      'https://web.example.test/api/2/accounts/orders?deleted=true',
    );
  });

  it('skips the request when there are no ids', async () => {
    const fetch = mockFetch(() => new Response('[]'));
    const client = testClient(fetch);
    await expect(client.accounts.info([])).resolves.toEqual([]);
    await expect(client.instruments.get([])).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
