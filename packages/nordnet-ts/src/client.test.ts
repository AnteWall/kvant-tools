import { describe, expect, it, vi } from 'vitest';

import { NordnetAuthenticationRequiredError, NordnetHttpError } from './errors.js';
import { TOKEN_PATH, jsonResponse, mockFetch, testClient } from './test-utils/http.js';

describe('NordnetClient transport', () => {
  it('refuses account calls without a session, before any request', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = testClient(fetch, null);
    await expect(client.accounts.list()).rejects.toBeInstanceOf(NordnetAuthenticationRequiredError);
    await expect(client.positions.list(['a'])).rejects.toBeInstanceOf(
      NordnetAuthenticationRequiredError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends cookies and client-id to www, keeps refreshed cookies and rolls the ntag header', async () => {
    let call = 0;
    const fetch = mockFetch(() => {
      call += 1;
      const headers = new Headers({ ntag: `ntag-${call}` });
      if (call === 1) headers.append('Set-Cookie', 'NEXT=refreshed; Path=/');
      return jsonResponse([], { headers });
    });
    const client = testClient(fetch);
    await client.accounts.list();
    await client.accounts.list();

    const [first, second] = fetch.mock.calls.map(([, init]) => new Headers(init?.headers));
    expect(first!.get('client-id')).toBe('NEXT');
    expect(first!.get('Cookie')).toBe('lang=sv; NOW=synthetic');
    expect(first!.has('ntag')).toBe(false);
    expect(second!.get('Cookie')).toBe('lang=sv; NOW=synthetic; NEXT=refreshed');
    expect(second!.get('ntag')).toBe('ntag-1');
    expect(client.session?.cookies.map((c) => c.key)).toEqual(['NOW', 'NEXT']);
  });

  it('sends the lang cookie the token endpoint requires, unless the jar has one', async () => {
    const fetch = mockFetch(() =>
      jsonResponse([], { headers: { 'Set-Cookie': 'lang=en; Path=/' } }),
    );
    const client = testClient(fetch);
    await client.accounts.list();
    await client.accounts.list();
    const cookies = fetch.mock.calls.map(([, init]) => new Headers(init?.headers).get('Cookie'));
    expect(cookies).toEqual(['lang=sv; NOW=synthetic', 'NOW=synthetic; lang=en']);
  });

  it('mints one API token for concurrent calls and mints a new one after a 401', async () => {
    let rejected = false;
    const fetch = mockFetch((url, init) => {
      if (!rejected && url.pathname.endsWith('/risk-metrics')) {
        rejected = true;
        return new Response(null, { status: 401 });
      }
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer synthetic-jwt');
      return jsonResponse({});
    });
    const client = testClient(fetch);
    await Promise.all([client.positions.list(['a']), client.watchlists.list()]);
    const mints = () =>
      fetch.mock.calls.filter(([u]) => new URL(u.toString()).pathname === TOKEN_PATH).length;
    expect(mints()).toBe(1);

    await client.performance.riskMetrics(['a']);
    expect(mints()).toBe(2);
  });

  it('throws NordnetHttpError with the parsed body on failure', async () => {
    const fetch = mockFetch(() =>
      jsonResponse({ error: 'Bad Request' }, { status: 400, statusText: 'Bad Request' }),
    );
    const error = await testClient(fetch)
      .performance.development(['a'], 'YEAR_1')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NordnetHttpError);
    expect(error).toMatchObject({ body: { error: 'Bad Request' }, status: 400 });
    expect((error as Error).message).toBe(
      'Nordnet request POST /holdings/historical-returns/v2/own-capital/development-by-period failed with status 400 Bad Request: Bad Request.',
    );
  });
});
