import { describe, expect, it } from 'vitest';

import { NordnetAuthenticationError } from '../errors.js';
import { jsonResponse, mockFetch, testClient } from '../test-utils/http.js';

const ORDER = '00000000-0000-4000-8000-0000000000b1';
const ORDERS = '/authentication/v1/methods/swedish-bankid/authentication-orders';

/** Answers the BankID order poll with `polls` in turn, and the session calls with synthetic data. */
function bankIdFetch(polls: readonly object[]) {
  let poll = 0;
  return mockFetch((url) => {
    if (url.pathname === ORDERS) return jsonResponse({ orderReference: ORDER });
    if (url.pathname === `${ORDERS}/${ORDER}`)
      return jsonResponse({ orderReference: ORDER, ...polls[poll++] });
    if (url.pathname === '/nnxapi/authentication/v2/sessions') {
      return jsonResponse(
        { customerId: 'customer-1', sessionReference: 'ref', scopes: ['identified-api'] },
        { headers: { 'Set-Cookie': 'NOW=new-session; Path=/' } },
      );
    }
    if (url.pathname === '/api/2/authentication/nnx-session/login') {
      return jsonResponse(
        { logged_in: true },
        { headers: { 'Set-Cookie': 'NEXT=legacy; Path=/' } },
      );
    }
    throw new Error(`unexpected ${url}`);
  });
}

describe('BankID login', () => {
  it('shows the QR from the first poll, keeps it while signing, then creates both sessions', async () => {
    const fetch = bankIdFetch([
      { status: 'PENDING', qrData: 'bankid.qr.0', hintCode: 'outstandingTransaction' },
      { status: 'PENDING', qrData: 'bankid.qr.1', hintCode: 'outstandingTransaction' },
      { status: 'PENDING', hintCode: 'userSign' },
      { status: 'COMPLETE' },
    ]);
    const client = testClient(fetch, null);

    const attempt = await client.auth.startBankId();
    expect(attempt.challenge).toEqual({ qrPayload: 'bankid.qr.0', refreshAfterMs: 1000 });
    expect(await attempt.poll()).toMatchObject({
      status: 'pending',
      challenge: { qrPayload: 'bankid.qr.1' },
    });
    expect(await attempt.poll()).toMatchObject({
      status: 'pending',
      challenge: { qrPayload: 'bankid.qr.1' },
    });

    const result = await attempt.poll();
    expect(result.status).toBe('complete');
    expect(client.session?.customerId).toBe('customer-1');
    expect(client.session?.cookies.map((c) => `${c.key}=${c.value}`)).toEqual([
      'NOW=new-session',
      'NEXT=legacy',
    ]);

    const calls = fetch.mock.calls.map(([u, init]) => [
      init?.method,
      new URL(u.toString()).pathname + new URL(u.toString()).search,
    ]);
    expect(calls[0]).toEqual(['POST', `${ORDERS}?useCase=QR`]);
    expect(calls.slice(-2)).toEqual([
      ['POST', '/nnxapi/authentication/v2/sessions'],
      ['POST', '/api/2/authentication/nnx-session/login'],
    ]);
    expect(JSON.parse(String(fetch.mock.calls.at(-2)![1]?.body))).toEqual({
      authenticationProvider: 'SWEDISH_BANKID',
      countryCode: 'SE',
      swedishBankId: { orderReference: ORDER },
    });
    // The legacy login rides on the cookie the new session just set.
    expect(new Headers(fetch.mock.calls.at(-1)![1]?.headers).get('Cookie')).toBe(
      'lang=sv; NOW=new-session',
    );
    await expect(attempt.poll()).rejects.toBeInstanceOf(NordnetAuthenticationError);
  });

  it.each([
    ['userCancel', 'denied'],
    ['cancelled', 'denied'],
    ['certificateErr', 'denied'],
    ['expiredTransaction', 'expired'],
    ['startFailed', 'expired'],
  ])('maps a failed order with hint %s to %s', async (hintCode, status) => {
    const client = testClient(
      bankIdFetch([
        { status: 'PENDING', qrData: 'q' },
        { status: 'FAILED', hintCode },
      ]),
      null,
    );
    const attempt = await client.auth.startBankId();
    expect(await attempt.poll()).toEqual({ status });
    expect(client.session).toBeUndefined();
  });

  it('stops polling once cancelled', async () => {
    const client = testClient(bankIdFetch([{ status: 'PENDING', qrData: 'q' }]), null);
    const attempt = await client.auth.startBankId();
    await attempt.cancel();
    await expect(attempt.poll()).rejects.toMatchObject({ code: 'cancelled' });
  });
});

describe('session checks', () => {
  it('reports an expired session as invalid instead of throwing', async () => {
    const client = testClient(mockFetch(() => new Response(null, { status: 401 })));
    await expect(client.auth.validateSession()).resolves.toBe(false);
  });

  it('reads a live session from the verify endpoint', async () => {
    const client = testClient(mockFetch(() => jsonResponse({ hasOnpremSession: true })));
    await expect(client.auth.validateSession()).resolves.toBe(true);
  });

  it('logs out remotely and forgets the session even if the call fails', async () => {
    const fetch = mockFetch(() => new Response(null, { status: 500 }));
    const client = testClient(fetch);
    await expect(client.auth.logout()).rejects.toThrow();
    expect(fetch.mock.calls[0]![1]?.method).toBe('DELETE');
    expect(client.session).toBeUndefined();
  });
});
