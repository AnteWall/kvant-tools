import type { ClientContext } from '../internal/client-context.js';

export interface NordnetWatchlistSummary {
  readonly hasOrderBook: boolean;
  readonly id: string;
  readonly isFull: boolean;
  readonly maxInstrumentsAllowed: number;
  readonly name: string;
  readonly numberOfInstruments: number;
}

export interface NordnetWatchlists {
  readonly isFull: boolean;
  readonly maxListsAllowed: number;
  readonly numberOfLists: number;
  readonly watchlists: readonly NordnetWatchlistSummary[];
}

export class WatchlistsClient {
  public constructor(private readonly context: ClientContext) {}

  public list(signal?: AbortSignal): Promise<NordnetWatchlists> {
    return this.context.http.request({
      access: 'required',
      host: 'api',
      method: 'GET',
      path: '/personalization/v1/my-watchlists',
      signal,
    });
  }

  /** One list with its instruments. The shape hasn't been captured yet, hence `unknown` values. */
  public get(id: string, signal?: AbortSignal): Promise<Readonly<Record<string, unknown>>> {
    return this.context.http.request({
      access: 'required',
      host: 'api',
      method: 'GET',
      path: `/personalization/v2/watchlists/${encodeURIComponent(id)}`,
      signal,
    });
  }
}
