import type { ClientContext } from '../internal/client-context.js';

/** Price periods of the time series; each comes in its own resolutions. */
export const seriesPeriods = [
  'DAY_1',
  'WEEK_1',
  'MONTH_1',
  'MONTH_3',
  'MONTH_6',
  'YTD',
  'YEAR_1',
  'YEAR_3',
  'YEAR_5',
  'YEAR_10',
  'ALL',
] as const;
export type SeriesPeriod = (typeof seriesPeriods)[number];

/** Latest prices of one instrument; `delay` is 0 when real-time for this login. */
export interface NordnetInstrumentPrice {
  readonly ask: number;
  readonly ask_volume: number;
  readonly bid: number;
  readonly bid_volume: number;
  readonly close: number;
  readonly delay: number;
  readonly high: number;
  readonly instrument_id: number;
  readonly last: number;
  readonly last_volume: number;
  readonly lot_size: number;
  readonly low: number;
  readonly open: number;
  readonly tick_timestamp: number;
  readonly trade_timestamp: number;
  readonly turnover: number;
  readonly turnover_volume: number;
  readonly vwap: number;
}

export interface NordnetPricePoint {
  readonly high: number;
  readonly last: number;
  readonly low: number;
  readonly open: number;
  readonly timeStamp: number;
  readonly volume: number;
}

export interface NordnetPriceSeries {
  readonly availablePeriods: readonly string[];
  readonly high: number;
  readonly low: number;
  readonly previousClose: number;
  readonly pricePoints: readonly NordnetPricePoint[];
  readonly returnedPeriod: string;
  readonly returnedResolution: string;
  /** Return per period, percent units. */
  readonly returns: Readonly<Partial<Record<SeriesPeriod, number>>>;
  readonly timeSeriesIdentifier: string;
  readonly validResolutionsForPeriod: readonly string[];
}

export interface NordnetLastDayReturn {
  readonly absoluteDevelopment: number;
  /** Percent units. */
  readonly development: number;
  /** Market-data order book id. */
  readonly id: string;
  readonly lastPrice: number;
}

export interface NordnetSearchHit {
  readonly close_price?: { readonly decimals: number; readonly price: number };
  readonly currency: string;
  readonly diff_pct_one_day?: number;
  readonly display_name: string;
  readonly display_symbol: string;
  readonly exchange_country?: string;
  readonly instrument_group_type: string;
  readonly instrument_id: number;
  readonly instrument_type: string;
  readonly last_price?: { readonly decimals: number; readonly price: number };
  readonly market_data_order_book_id?: string;
  readonly market_info?: { readonly identifier: string; readonly market_id: number };
  readonly nnx_instrument_id?: string;
  readonly turnover?: number;
  readonly turnover_volume?: number;
}

export interface NordnetSearchGroup {
  readonly display_group_description: string;
  readonly display_group_type: string;
  readonly results: readonly NordnetSearchHit[];
}

export interface NordnetNewsItem {
  readonly agency: { readonly id: string; readonly name: string };
  readonly headline: string;
  readonly id: string;
  readonly instrumentIds: readonly string[];
  readonly intro?: string;
  readonly language: string;
  readonly newsType: string;
  /** Epoch milliseconds. */
  readonly published: number;
}

export interface NordnetNewsPage {
  readonly limit: number;
  readonly news: readonly NordnetNewsItem[];
  readonly offset: number;
  readonly total: number;
}

export interface NordnetArticle {
  readonly agency: { readonly id: string; readonly name: string };
  /** The article, as Markdown. */
  readonly articleMarkdownText: string;
  readonly headline: string;
  readonly id: string;
  readonly language: string;
  readonly newsType: string;
  /** Epoch milliseconds. */
  readonly published: number;
}

export interface NordnetExchangeRate {
  readonly from: string;
  readonly to: string;
  readonly value: number;
}

/** An index or other indicator, e.g. `omxs30`. */
export interface NordnetIndicator {
  readonly countryCode: string;
  readonly instrumentId: string;
  readonly isin: string;
  readonly name: string;
  readonly orderBookId: string;
  readonly price: {
    readonly absoluteDevelopment: number;
    readonly close: number;
    /** Percent units. */
    readonly development: number;
    readonly high: number;
    readonly last: number;
    readonly low: number;
    readonly timestamp: number;
  };
  readonly symbol: string;
  readonly type: string;
}

export interface NordnetAmountValue {
  readonly currency: string;
  readonly value: number;
}

export interface NordnetRatings {
  readonly currentRating?: {
    readonly priceTarget: {
      readonly high: NordnetAmountValue;
      readonly low: NordnetAmountValue;
      readonly mean: NordnetAmountValue;
      readonly numberOfEstimates: number;
    };
    readonly ratingDetails: {
      readonly buy: { readonly count: number };
      readonly hold: { readonly count: number };
      readonly sell: { readonly count: number };
      readonly totalCount: number;
    };
    readonly ratingPeriod: string;
  };
}

export interface NordnetDividendEvent {
  readonly amount: NordnetAmountValue;
  readonly eventType: { readonly displayName: string; readonly value: string };
  readonly id: string;
  readonly paymentDate?: string;
  readonly recordDate?: string;
  readonly status: string;
  readonly xDate: string;
}

export interface NordnetDividends {
  readonly currentDividendEvent?: NordnetDividendEvent;
  readonly dividendEvents: readonly NordnetDividendEvent[];
}

export interface NordnetCompanyEvent {
  readonly date: string;
  readonly displayName: string;
  readonly eventType: { readonly displayName: string; readonly value: string };
  readonly id: string;
}

export interface NordnetCompanyProfile {
  readonly classification?: {
    readonly sector?: { readonly displayName: string };
    readonly industry?: { readonly displayName: string };
  };
  readonly companyIdentity?: {
    readonly businessDescription?: string;
    readonly ceo?: string;
    readonly companyName: string;
    readonly websiteUrl?: string;
  };
  readonly headquartersCountryCode?: string;
  readonly instrumentId: string;
  readonly isin: string;
}

export interface NordnetKeyFigure {
  readonly currentValue: number;
  readonly displayName: string;
  readonly keyFigureType: string;
  readonly numberOfDecimals: number;
  readonly unit: string;
}

/**
 * Market data. Nordnet's instruments have three ids: `instrument_id` (legacy, numeric) for
 * `/api/2`, `nnx_instrument_id` for company data and news, and the market-data order book id
 * (`nnx_market_data_order_book_id`) for prices over time; `instruments.get` gives all three.
 * Depth and trades take a tradable id, `market_id:identifier` (e.g. `11:INVE B`).
 */
export class MarketClient {
  public constructor(private readonly context: ClientContext) {}

  /** Latest prices for instruments by legacy id. */
  public prices(
    instrumentIds: readonly number[],
    signal?: AbortSignal,
  ): Promise<readonly NordnetInstrumentPrice[]> {
    if (instrumentIds.length === 0) return Promise.resolve([]);
    return this.#web(`/api/2/instruments/price/${instrumentIds.join(',')}`, signal);
  }

  /** Prices over a period; `resolution` must be one the period allows (see the answer). */
  public series(
    marketDataId: string,
    period: SeriesPeriod,
    resolution?: string,
    signal?: AbortSignal,
  ): Promise<NordnetPriceSeries> {
    return this.context.http.request({
      access: 'required',
      host: 'api',
      method: 'GET',
      path: `/market-data/v3/price-time-series/period/${period}/identifier/${encodeURIComponent(marketDataId)}`,
      query: { resolution },
      signal,
    });
  }

  /** Today's change of several instruments at once, by market-data order book id. */
  public lastDay(
    marketDataIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<readonly NordnetLastDayReturn[]> {
    if (marketDataIds.length === 0) return Promise.resolve([]);
    return this.#api(
      `/market-data/v3/price-time-series/returns/lastday?identifiers=${marketDataIds.map(encodeURIComponent).join(',')}`,
      signal,
    );
  }

  /** Free-text search over every instrument kind, grouped by kind. */
  public search(
    query: string,
    limit = 5,
    signal?: AbortSignal,
  ): Promise<readonly NordnetSearchGroup[]> {
    return this.context.http.request({
      access: 'anonymous',
      host: 'web',
      method: 'GET',
      path: '/api/2/main_search',
      query: { limit, query, search_space: 'ALL' },
      signal,
    });
  }

  /** Order depth; undefined when this login has no access to it. */
  public depth(tradableId: string, signal?: AbortSignal): Promise<unknown> {
    return this.#web(`/api/2/tradables/depth/${encodeURIComponent(tradableId)}`, signal);
  }

  /** Today's trades; the item shape hasn't been captured yet. */
  public trades(
    tradableId: string,
    signal?: AbortSignal,
  ): Promise<readonly { readonly trades: readonly Readonly<Record<string, unknown>>[] }[]> {
    return this.#web(`/api/2/tradables/trades/${encodeURIComponent(tradableId)}`, signal);
  }

  /** News about one instrument, newest first, by `nnx_instrument_id`. */
  public news(nnxInstrumentId: string, limit = 20, signal?: AbortSignal): Promise<NordnetNewsPage> {
    return this.#api(
      `/news/v1/news/preview/instrument/${encodeURIComponent(nnxInstrumentId)}?offset=0&limit=${limit}`,
      signal,
    );
  }

  /** One article in full. */
  public article(id: string, signal?: AbortSignal): Promise<NordnetArticle> {
    return this.#api(`/news/v1/news/${encodeURIComponent(id)}`, signal);
  }

  public exchangeRates(signal?: AbortSignal): Promise<readonly NordnetExchangeRate[]> {
    return this.#web('/api/2/exchange_rates', signal);
  }

  /** An index or other indicator by its slug, e.g. `omxs30`. */
  public indicator(slug: string, signal?: AbortSignal): Promise<NordnetIndicator> {
    return this.#api(`/instrument-screening/v1/indicator/web/${encodeURIComponent(slug)}`, signal);
  }

  public ratings(marketDataId: string, signal?: AbortSignal): Promise<NordnetRatings> {
    return this.#api(`/company-data/v1/ratings/${encodeURIComponent(marketDataId)}`, signal);
  }

  public dividends(marketDataId: string, signal?: AbortSignal): Promise<NordnetDividends> {
    return this.#api(
      `/company-data/v2/corporate-actions/order-books/${encodeURIComponent(marketDataId)}/dividends`,
      signal,
    );
  }

  public companyEvents(
    nnxInstrumentId: string,
    signal?: AbortSignal,
  ): Promise<{ readonly events: readonly NordnetCompanyEvent[] }> {
    return this.#api(
      `/company-data/v1/company-events/instruments/${encodeURIComponent(nnxInstrumentId)}`,
      signal,
    );
  }

  public companyProfiles(
    nnxInstrumentIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<readonly NordnetCompanyProfile[]> {
    return this.#api(
      `/company-data/v1/company-profile/instruments?instrumentIds=${nnxInstrumentIds.map(encodeURIComponent).join(',')}`,
      signal,
    );
  }

  public keyFigures(
    marketDataId: string,
    signal?: AbortSignal,
  ): Promise<{ readonly keyFigures: readonly NordnetKeyFigure[] }> {
    return this.#api(
      `/company-data/v1/key-figures/instruments/${encodeURIComponent(marketDataId)}`,
      signal,
    );
  }

  #web<Response>(path: string, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request({
      access: 'required',
      host: 'web',
      method: 'GET',
      path,
      signal,
    });
  }

  #api<Response>(path: string, signal?: AbortSignal): Promise<Response> {
    return this.context.http.request({
      access: 'required',
      host: 'api',
      method: 'GET',
      path,
      signal,
    });
  }
}
