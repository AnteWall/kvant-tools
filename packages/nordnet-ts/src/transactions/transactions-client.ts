import type { IsoDate, NordnetAmount } from '../internal/amounts.js';
import type { ClientContext } from '../internal/client-context.js';

/** One transaction. Trades carry the instrument fields; deposits and fees don't. */
export interface NordnetTransaction {
  readonly accountId: string;
  readonly accountNumber?: number;
  readonly accountingDate: IsoDate;
  readonly acquisitionCost?: NordnetAmount;
  /** Signed, in the account's currency. */
  readonly amount?: NordnetAmount;
  readonly balance?: NordnetAmount;
  readonly businessDate?: IsoDate;
  /** The instrument's currency, for trades. */
  readonly currencyTo?: string;
  readonly fxPrice?: number;
  readonly instrumentClass?: string;
  readonly instrumentName?: string;
  readonly instrumentShortName?: string;
  readonly isinCode?: string;
  readonly legacyInstrumentId?: number;
  readonly price?: NordnetAmount;
  readonly quantity?: number;
  readonly settlementDate?: IsoDate;
  readonly totalCharges?: NordnetAmount;
  readonly transactionId: string;
  /** Nordnet's group: `transaction-and-notes-buy-sell`, `…-deposit-withdrawal`, … */
  readonly transactionTag?: string;
  /** What the account statement says, e.g. a subscription or a deposit's channel. */
  readonly transactionText?: string;
  /** Short code: `K` buy, `S` sell, `#RI` deposit, … */
  readonly transactionTypeCode?: string;
  readonly transactionTypeName?: string;
  readonly valueDate?: IsoDate;
  readonly verificationNumber?: number;
}

export interface TransactionPageOptions {
  readonly accountIds: readonly string[];
  readonly fromDate: IsoDate;
  readonly includeCancellations?: boolean;
  readonly limit?: number;
  readonly offset?: number;
  readonly sortOrder?: 'ASC' | 'DESC';
  readonly toDate: IsoDate;
}

export class TransactionsClient {
  public constructor(private readonly context: ClientContext) {}

  /** One page of transactions over a date range, newest first by default. */
  public page(
    options: TransactionPageOptions,
    signal?: AbortSignal,
  ): Promise<readonly NordnetTransaction[]> {
    return this.context.http.request({
      access: 'required',
      body: {
        accountIds: options.accountIds,
        fromDate: options.fromDate,
        includeCancellations: options.includeCancellations ?? false,
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
        sort: 'ACCOUNTING_DATE',
        sortOrder: options.sortOrder ?? 'DESC',
        toDate: options.toDate,
      },
      host: 'api',
      method: 'POST',
      path: '/transaction/transaction-and-notes/v2/transactions/page',
      signal,
    });
  }
}
