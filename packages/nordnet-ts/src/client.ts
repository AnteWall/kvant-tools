import { AccountsClient } from './accounts/accounts-client.js';
import { AlertsClient } from './alerts/alerts-client.js';
import { AuthClient } from './auth/auth-client.js';
import type { NordnetSession } from './auth/session.js';
import { InstrumentsClient } from './instruments/instruments-client.js';
import type { ClientContext } from './internal/client-context.js';
import { HttpClient } from './internal/http-client.js';
import { MarketClient } from './market/market-client.js';
import { OrdersClient } from './orders/orders-client.js';
import { PerformanceClient } from './performance/performance-client.js';
import { PositionsClient } from './positions/positions-client.js';
import { TransactionsClient } from './transactions/transactions-client.js';
import { WatchlistsClient } from './watchlists/watchlists-client.js';

export interface NordnetClientOptions {
  /** Nordnet's cloud API. Defaults to `https://api.prod.nntech.io`. */
  readonly apiBaseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  /** Sent as `x-locale`; decides the language of type names. Defaults to `sv-SE`. */
  readonly locale?: string;
  readonly session?: NordnetSession;
  /** Defaults to `https://www.nordnet.se`. */
  readonly webBaseUrl?: string;
}

export class NordnetClient {
  #session: NordnetSession | undefined;

  public readonly accounts: AccountsClient;
  public readonly alerts: AlertsClient;
  public readonly auth: AuthClient;
  public readonly instruments: InstrumentsClient;
  public readonly market: MarketClient;
  public readonly orders: OrdersClient;
  public readonly performance: PerformanceClient;
  public readonly positions: PositionsClient;
  public readonly transactions: TransactionsClient;
  public readonly watchlists: WatchlistsClient;

  public constructor(options: NordnetClientOptions = {}) {
    this.#session = options.session;
    const http = new HttpClient({
      ...(options.apiBaseUrl === undefined ? {} : { apiBaseUrl: options.apiBaseUrl }),
      ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
      ...(options.locale === undefined ? {} : { locale: options.locale }),
      ...(options.webBaseUrl === undefined ? {} : { webBaseUrl: options.webBaseUrl }),
      getSession: () => this.#session,
      updateSession: (session) => this.setSession(session),
    });
    const context: ClientContext = {
      http,
      session: {
        clear: () => this.clearSession(),
        get: () => this.#session,
        set: (session) => this.setSession(session),
      },
    };

    this.accounts = new AccountsClient(context);
    this.alerts = new AlertsClient(context);
    this.auth = new AuthClient(context);
    this.instruments = new InstrumentsClient(context);
    this.market = new MarketClient(context);
    this.orders = new OrdersClient(context);
    this.performance = new PerformanceClient(context);
    this.positions = new PositionsClient(context);
    this.transactions = new TransactionsClient(context);
    this.watchlists = new WatchlistsClient(context);
  }

  /** The current session; changes as Nordnet refreshes its cookies, so persist it after calls. */
  public get session(): NordnetSession | undefined {
    return this.#session;
  }

  public setSession(session: NordnetSession): void {
    this.#session = session;
  }

  public clearSession(): void {
    this.#session = undefined;
  }
}
