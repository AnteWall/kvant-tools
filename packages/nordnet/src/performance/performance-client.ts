import type { IsoDate, NordnetAmount } from '../internal/amounts.js';
import { sortedIds, type ClientContext } from '../internal/client-context.js';

export const returnPeriods = [
  'DAY_1',
  'WEEK_1',
  'MONTH_1',
  'MONTH_3',
  'MONTH_6',
  'YTD',
  'YEAR_1',
  'YEAR_3',
  'YEAR_5',
  'ALL',
] as const;

export type ReturnPeriod = (typeof returnPeriods)[number];

/** One day of the value graph. Nordnet abbreviates the keys to keep the series small. */
export interface NordnetReturnPoint {
  /** Date, `YYYY-MM-DD`. */
  readonly d: string;
  /** Return in money since the start of the range. */
  readonly rM: number;
  /** Return in money, accumulated. */
  readonly rMA: number;
  /** Return in percent since the start of the range. */
  readonly rP: number;
  /** Return in percent, accumulated. */
  readonly rPA: number;
  /** Own capital. */
  readonly oC: number;
  /** Market value. */
  readonly mV: number;
  /** Cash balance. */
  readonly b: number;
  /** Net cash flow (deposits minus withdrawals) that day. */
  readonly cNF: number;
}

export interface NordnetPeriodReturn {
  readonly monetaryReturn: NordnetAmount;
  readonly ownCapitalChange?: NordnetAmount;
  readonly percentageReturn: number;
  readonly period: ReturnPeriod;
}

export interface NordnetReturnGraph {
  readonly currencyCode: string;
  readonly periodReturns: readonly NordnetPeriodReturn[];
  readonly returns: readonly NordnetReturnPoint[];
}

export interface NordnetPeriodDevelopment {
  readonly accountDevelopments: readonly {
    readonly accountId: string;
    readonly accountNumber: number;
    readonly currencyCode: string;
    readonly returnMonetary: number;
    readonly returnPercentage: number;
  }[];
  readonly totalReturnMonetary: NordnetAmount;
  readonly totalReturnPercentage: number;
}

export interface NordnetRiskMetrics {
  readonly sharpeRatios: Readonly<Record<string, number>>;
  readonly volatilities: Readonly<Record<string, number>>;
}

export interface NordnetReturnsByYear {
  readonly cagr: number;
  readonly returnsByYear: readonly { readonly returnPercentage: number; readonly year: number }[];
}

const BASE = '/holdings/historical-returns/v2/own-capital';

export class PerformanceClient {
  public constructor(private readonly context: ClientContext) {}

  /** Daily value and return series over a date range, plus the standard period returns. */
  public graph(
    accountIds: readonly string[],
    range: { readonly fromDate: IsoDate; readonly toDate: IsoDate },
    signal?: AbortSignal,
  ): Promise<NordnetReturnGraph> {
    return this.#post('graph', { accountIds: sortedIds(accountIds), ...range }, signal);
  }

  /** Return over one period, per account and in total. */
  public development(
    accountIds: readonly string[],
    period: ReturnPeriod,
    signal?: AbortSignal,
  ): Promise<NordnetPeriodDevelopment> {
    return this.#post(
      'development-by-period',
      { accountIds: sortedIds(accountIds), period },
      signal,
    );
  }

  /** Sharpe ratio and volatility over several horizons. */
  public riskMetrics(
    accountIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<NordnetRiskMetrics> {
    return this.#post('risk-metrics', { accountIds: sortedIds(accountIds) }, signal);
  }

  public returnsByYear(
    accountIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<NordnetReturnsByYear> {
    return this.#post('returns/by-year', { accountIds: sortedIds(accountIds) }, signal);
  }

  #post<Response>(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request({
      access: 'required',
      body,
      host: 'api',
      method: 'POST',
      path: `${BASE}/${path}`,
      signal,
    });
  }
}
