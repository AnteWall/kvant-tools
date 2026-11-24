import type { NordnetLegacyAmount } from '../internal/amounts.js';
import type { ClientContext } from '../internal/client-context.js';

export interface NordnetAccount {
  /** The integer id the legacy `/api/2` endpoints take. */
  readonly accid: number;
  /** The account number shown to the user. */
  readonly accno: number;
  /** The UUID the cloud endpoints take as `accountIds`. */
  readonly account_id: string;
  readonly account_code: string;
  readonly alias?: string;
  /** Nordnet's account type id. */
  readonly atyid: number;
  readonly bank_accno?: string;
  readonly default?: boolean;
  readonly role: string;
  /** Short type code, e.g. `AF`, `ISK`, `KF`. */
  readonly symbol: string;
  /** Type name in the session's language, e.g. `Investeringssparkonto`. */
  readonly type: string;
}

export interface NordnetAccountInfo {
  readonly accid: number;
  readonly accno: number;
  readonly account_code: string;
  readonly account_credit: NordnetLegacyAmount;
  readonly account_currency: string;
  /** Cash. */
  readonly account_sum: NordnetLegacyAmount;
  readonly bank_accno?: string;
  readonly buy_orders_value: NordnetLegacyAmount;
  readonly collateral: NordnetLegacyAmount;
  readonly equity: NordnetLegacyAmount;
  readonly forward_sum: NordnetLegacyAmount;
  readonly full_marketvalue: NordnetLegacyAmount;
  readonly future_sum: NordnetLegacyAmount;
  readonly interest: NordnetLegacyAmount;
  readonly interest_rate?: number;
  readonly loan_limit: NordnetLegacyAmount;
  readonly own_capital: NordnetLegacyAmount;
  readonly own_capital_morning: NordnetLegacyAmount;
  readonly pawn_value: NordnetLegacyAmount;
  readonly registration_date?: string;
  readonly reserved?: Readonly<Record<string, NordnetLegacyAmount>>;
  readonly short_positions_margin: NordnetLegacyAmount;
  /** Buying power. */
  readonly trading_power: NordnetLegacyAmount;
  readonly unrealized_future_profit_loss: NordnetLegacyAmount;
}

export class AccountsClient {
  public constructor(private readonly context: ClientContext) {}

  public list(signal?: AbortSignal): Promise<readonly NordnetAccount[]> {
    return this.context.http.request({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: '/api/2/accounts',
      signal,
    });
  }

  /** Cash, buying power and value for each account, by legacy `accid`. */
  public info(
    accids: readonly number[],
    signal?: AbortSignal,
  ): Promise<readonly NordnetAccountInfo[]> {
    if (accids.length === 0) return Promise.resolve([]);
    return this.context.http.request({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: `/api/2/accounts/${accids.join(',')}/info`,
      signal,
    });
  }
}
