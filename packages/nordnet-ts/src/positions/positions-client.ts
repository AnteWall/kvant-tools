import type { IsoDate, NordnetAmount, NordnetDualAmount } from '../internal/amounts.js';
import { sortedIds, type ClientContext } from '../internal/client-context.js';

/** One holding in one account. */
export interface NordnetPosition {
  readonly accountId: string;
  readonly acquisitionCost?: NordnetDualAmount;
  readonly averageAcquisitionCost?: NordnetDualAmount;
  readonly backofficeInstrumentId?: number;
  /** `STOCK`, `FUND`, … */
  readonly instrumentClass?: string;
  readonly instrumentName?: string;
  /** Today's price change, percent. */
  readonly instrumentOneDayReturn?: number;
  readonly isin?: string;
  readonly isMutualFund?: boolean;
  /** The instrument id `/api/2/instruments/{id}` takes. */
  readonly legacyInstrumentId: number;
  readonly marginPercentage?: number;
  readonly marketDataOrderBookId?: string;
  readonly marketValue?: NordnetDualAmount;
  readonly pawnValue?: NordnetAmount;
  /** Last price, in the instrument's currency. */
  readonly price?: NordnetAmount;
  readonly priceDate?: IsoDate;
  readonly quantity: number;
  readonly returnMonetary?: NordnetDualAmount;
  readonly returnPercentage?: number;
  readonly tradingOrderBookId?: string;
}

export interface NordnetPositionSummary {
  readonly acquisitionCost: NordnetAmount;
  readonly marketValue: NordnetAmount;
  readonly returnMonetary: NordnetAmount;
  readonly returnPercentage: number;
}

export interface NordnetPositions {
  readonly exchangeTradedPositions: readonly NordnetPosition[];
  readonly exchangeTradedSummary: NordnetPositionSummary;
  readonly fundPositions: readonly NordnetPosition[];
  readonly fundSummary: NordnetPositionSummary;
  readonly totalSummary: NordnetPositionSummary;
}

export interface NordnetOwnCapitalAccount {
  readonly accountId: string;
  readonly balance: NordnetAmount;
  readonly forwardSum: NordnetAmount;
  readonly futureSum: NordnetAmount;
  readonly interest: NordnetAmount;
  readonly marketValue: NordnetAmount;
  readonly ownCapital: NordnetAmount;
}

export interface NordnetOwnCapital {
  readonly ownCapitalPerAccount: readonly NordnetOwnCapitalAccount[];
  readonly ownCapitalTotal: Omit<NordnetOwnCapitalAccount, 'accountId'> & {
    readonly creditBalance: NordnetAmount;
    readonly creditInterest: NordnetAmount;
  };
}

export class PositionsClient {
  public constructor(private readonly context: ClientContext) {}

  /** Holdings in the given accounts (UUID `account_id`s). */
  public list(accountIds: readonly string[], signal?: AbortSignal): Promise<NordnetPositions> {
    return this.#post('/holdings/positions/v2/positions', accountIds, signal);
  }

  /** Cash, market value and own capital per account and in total. */
  public ownCapital(
    accountIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<NordnetOwnCapital> {
    return this.#post('/holdings/own-capital/v2/own-capital', accountIds, signal);
  }

  #post<Response>(
    path: string,
    accountIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<Response> {
    return this.context.http.request({
      access: 'required',
      body: { accountIds: sortedIds(accountIds) },
      host: 'api',
      method: 'POST',
      path,
      signal,
    });
  }
}
