import { NordnetAuthenticationError, NordnetHttpError } from '../errors.js';
import type { ClientContext } from '../internal/client-context.js';
import type { NordnetSession } from './session.js';

const BANKID_ORDERS_PATH = '/authentication/v1/methods/swedish-bankid/authentication-orders';
const SESSIONS_PATH = '/nnxapi/authentication/v2/sessions';
const LEGACY_LOGIN_PATH = '/api/2/authentication/nnx-session/login';
const CURRENT_SESSION_PATH = '/nnxapi/authentication/v1/sessions/current';
/** nordnet.se polls the order about once a second; each poll carries the next animated QR code. */
const REFRESH_AFTER_MS = 1_000;

export interface BankIdChallenge {
  /** Render as a QR code; it changes every poll. */
  readonly qrPayload: string;
  readonly refreshAfterMs: number;
}

export type BankIdPollResult =
  | { readonly challenge: BankIdChallenge; readonly status: 'pending' }
  | { readonly session: NordnetSession; readonly status: 'complete' }
  | { readonly status: 'denied' }
  | { readonly status: 'expired' };

export interface BankIdOrder {
  readonly hintCode?: string;
  readonly orderReference: string;
  readonly qrData?: string;
  /** `PENDING`, `COMPLETE` or `FAILED`. */
  readonly status: string;
}

export interface SessionCreated {
  readonly authenticationMethod: string;
  readonly countryCode: string;
  readonly customerId: string;
  readonly scopes: readonly string[];
  readonly sessionReference: string;
}

export interface SessionVerification {
  readonly hasOnpremSession: boolean;
  readonly onpremCsrfToken?: string;
}

export class AuthClient {
  public constructor(private readonly context: ClientContext) {}

  /** Starts a BankID QR login. Show `attempt.challenge`, then `poll()` until it is no longer pending. */
  public startBankId(signal?: AbortSignal): Promise<BankIdAuthAttempt> {
    return BankIdAuthAttempt.start(this.context, signal);
  }

  /** Whether the stored session is still logged in. */
  public async validateSession(signal?: AbortSignal): Promise<boolean> {
    try {
      const body = await this.context.http.request<SessionVerification>({
        access: 'required',
        host: 'web',
        method: 'GET',
        path: `${SESSIONS_PATH}/verify`,
        signal,
      });
      return body.hasOnpremSession;
    } catch (error) {
      if (error instanceof NordnetHttpError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      throw error;
    }
  }

  /** Ends the session at Nordnet, then drops it locally. */
  public async logout(signal?: AbortSignal): Promise<void> {
    try {
      await this.context.http.request({
        access: 'required',
        host: 'web',
        method: 'DELETE',
        path: CURRENT_SESSION_PATH,
        signal,
      });
    } finally {
      this.context.session.clear();
      this.context.http.resetCookies();
    }
  }
}

export class BankIdAuthAttempt {
  #cancelled = false;
  #challenge: BankIdChallenge;
  #terminal = false;

  private constructor(
    private readonly context: ClientContext,
    private readonly orderReference: string,
    challenge: BankIdChallenge,
    private readonly signal: AbortSignal | undefined,
  ) {
    this.#challenge = challenge;
  }

  public get challenge(): BankIdChallenge {
    return this.#challenge;
  }

  public static async start(
    context: ClientContext,
    signal?: AbortSignal,
  ): Promise<BankIdAuthAttempt> {
    context.session.clear();
    context.http.resetCookies();
    const { orderReference } = await context.http.request<{ readonly orderReference: string }>({
      access: 'anonymous',
      host: 'api',
      method: 'POST',
      path: BANKID_ORDERS_PATH,
      query: { useCase: 'QR' },
      signal,
    });
    if (typeof orderReference !== 'string')
      throw new NordnetAuthenticationError('malformed_response');
    // The order only carries QR data once polled.
    const order = await getOrder(context, orderReference, signal);
    if (order.qrData === undefined) throw new NordnetAuthenticationError('malformed_response');
    return new BankIdAuthAttempt(context, orderReference, toChallenge(order.qrData), signal);
  }

  public async poll(): Promise<BankIdPollResult> {
    if (this.#cancelled) throw new NordnetAuthenticationError('cancelled');
    if (this.#terminal) throw new NordnetAuthenticationError('protocol');

    const order = await getOrder(this.context, this.orderReference, this.signal);
    if (order.status === 'PENDING') {
      // While the user signs in the app there is no QR code; keep showing the last one.
      if (order.qrData !== undefined) this.#challenge = toChallenge(order.qrData);
      return { challenge: this.#challenge, status: 'pending' };
    }

    this.#terminal = true;
    if (order.status === 'COMPLETE')
      return { session: await this.#createSession(), status: 'complete' };
    return {
      status:
        order.hintCode === 'expiredTransaction' || order.hintCode === 'startFailed'
          ? 'expired'
          : 'denied',
    };
  }

  // ponytail: no cancel endpoint found in nordnet.se's bundle; the order simply expires at BankID.
  public cancel(): Promise<void> {
    this.#cancelled = true;
    return Promise.resolve();
  }

  async #createSession(): Promise<NordnetSession> {
    const { http } = this.context;
    const created = await http.request<SessionCreated>({
      access: 'anonymous',
      body: {
        authenticationProvider: 'SWEDISH_BANKID',
        countryCode: 'SE',
        swedishBankId: { orderReference: this.orderReference },
      },
      host: 'web',
      method: 'POST',
      path: SESSIONS_PATH,
      signal: this.signal,
    });
    // The legacy /api/2 endpoints need their own session on top of the new one.
    await http.request({
      access: 'anonymous',
      body: {},
      host: 'web',
      method: 'POST',
      path: LEGACY_LOGIN_PATH,
      signal: this.signal,
    });
    const session: NordnetSession = { cookies: http.cookies, customerId: created.customerId };
    this.context.session.set(session);
    return session;
  }
}

function getOrder(
  context: ClientContext,
  orderReference: string,
  signal?: AbortSignal,
): Promise<BankIdOrder> {
  return context.http.request<BankIdOrder>({
    access: 'anonymous',
    host: 'api',
    method: 'GET',
    path: `${BANKID_ORDERS_PATH}/${encodeURIComponent(orderReference)}`,
    signal,
  });
}

function toChallenge(qrPayload: string): BankIdChallenge {
  return { qrPayload, refreshAfterMs: REFRESH_AFTER_MS };
}
