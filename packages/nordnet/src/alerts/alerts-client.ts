import type { ClientContext } from '../internal/client-context.js';

export interface NordnetPriceAlarms {
  /** The alarm shape hasn't been captured yet, hence `unknown` values. */
  readonly results: readonly Readonly<Record<string, unknown>>[];
  readonly rows: number;
  readonly total_hits: number;
}

export class AlertsClient {
  public constructor(private readonly context: ClientContext) {}

  public priceAlarms(signal?: AbortSignal): Promise<NordnetPriceAlarms> {
    return this.context.http.request({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: '/api/2/price_alarms/alarms',
      signal,
    });
  }
}
