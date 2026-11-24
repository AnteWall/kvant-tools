import type { ClientContext } from '../internal/client-context.js';

export interface NordnetTradable {
  readonly display_order: number;
  /** The symbol on that market, e.g. `INVE B`. */
  readonly identifier: string;
  readonly lot_size: number;
  readonly market_id: number;
  readonly mic: string;
  readonly price_unit: string;
  readonly tick_size_id: number;
}

export interface NordnetInstrument {
  readonly asset_class: string;
  readonly currency: string;
  readonly instrument_group_type: string;
  readonly instrument_id: number;
  readonly instrument_type: string;
  readonly isin_code: string;
  readonly name: string;
  readonly nnx_instrument?: {
    readonly instrument_id: number;
    readonly nnx_custody_instrument_id?: string;
    readonly nnx_instrument_id?: string;
    readonly nnx_market_data_order_book_id?: string;
    readonly nnx_trading_order_book_id?: string;
  };
  readonly price_type: string;
  readonly sector?: string;
  readonly sector_group?: string;
  readonly symbol: string;
  readonly tradables: readonly NordnetTradable[];
}

export class InstrumentsClient {
  public constructor(private readonly context: ClientContext) {}

  /** Instruments by Nordnet id (a position's `legacyInstrumentId`). */
  public get(ids: readonly number[], signal?: AbortSignal): Promise<readonly NordnetInstrument[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.context.http.request({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: `/api/2/instruments/${ids.join(',')}`,
      signal,
    });
  }

  /** The listing of an ISIN in one currency on one Nordnet market (11 = Stockholm). */
  public byIsin(
    isin: string,
    currency: string,
    marketId: number,
    signal?: AbortSignal,
  ): Promise<readonly NordnetInstrument[]> {
    return this.context.http.request({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: `/api/2/instruments/lookup/isin_code_currency_market_id/${encodeURIComponent(`${isin}:${currency}:${marketId}`)}`,
      signal,
    });
  }
}
