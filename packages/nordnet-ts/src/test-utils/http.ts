import { readFileSync } from 'node:fs';

import { expect, vi } from 'vitest';

import type { NordnetSession } from '../auth/session.js';
import { NordnetClient } from '../client.js';

export const WEB = 'https://web.example.test';
export const API = 'https://api.example.test';
export const TOKEN_PATH = '/nnxapi/authorization/v1/tokens';
export const testSession: NordnetSession = {
  cookies: [{ domain: 'web.example.test', key: 'NOW', path: '/', value: 'synthetic' }],
};

export interface HttpFixture<ResponseBody = unknown> {
  readonly request: { readonly body?: unknown; readonly method: string; readonly path: string };
  readonly response: { readonly body: ResponseBody; readonly status: number };
}

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function loadHttpFixture<ResponseBody>(path: string): HttpFixture<ResponseBody> {
  return JSON.parse(
    readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'),
  ) as HttpFixture<ResponseBody>;
}

export function testClient(
  fetch: typeof globalThis.fetch,
  /** `null` for a client that isn't logged in. */
  session: NordnetSession | null = testSession,
): NordnetClient {
  return new NordnetClient({
    apiBaseUrl: API,
    fetch,
    webBaseUrl: WEB,
    ...(session === null ? {} : { session }),
  });
}

/** A fetch mock that mints API tokens itself and hands every other request to `respond`. */
export function mockFetch(
  respond: (url: URL, init: RequestInit | undefined) => Response | Promise<Response>,
) {
  return vi.fn<typeof globalThis.fetch>(async (input, init) => {
    const url = new URL(input.toString());
    if (url.pathname === TOKEN_PATH) return jsonResponse({ jwt: 'synthetic-jwt' }, { status: 201 });
    return respond(url, init);
  });
}

/** Calls `/path` through `call`, replying with the fixture, and checks the outgoing request. */
export async function expectFixtureReplay(
  path: string,
  call: (client: NordnetClient) => Promise<unknown>,
) {
  const fixture = loadHttpFixture(path);
  const fetch = mockFetch(() =>
    jsonResponse(fixture.response.body, { status: fixture.response.status }),
  );
  await expect(call(testClient(fetch))).resolves.toEqual(fixture.response.body);

  const sent = fetch.mock.calls
    .map(([input, init]) => ({ init, url: new URL(input.toString()) }))
    .filter(({ url }) => url.pathname !== TOKEN_PATH);
  expect(sent).toHaveLength(1);
  const { init, url } = sent[0]!;
  expect({
    method: init?.method,
    path: url.pathname + url.search,
    ...(init?.body === undefined ? {} : { body: JSON.parse(String(init.body)) as unknown }),
  }).toEqual(fixture.request);

  const headers = new Headers(init?.headers);
  if (url.origin === API) expect(headers.get('Authorization')).toBe('Bearer synthetic-jwt');
  else expect(headers.get('Cookie')).toBe('lang=sv; NOW=synthetic');
}
