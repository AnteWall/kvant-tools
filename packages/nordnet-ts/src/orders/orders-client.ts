import type { ClientContext } from '../internal/client-context.js';

/** Order and trade shapes haven't been captured yet (the endpoints answer 204 when empty). */
export type NordnetOrder = Readonly<Record<string, unknown>>;
export type NordnetTrade = Readonly<Record<string, unknown>>;

export class OrdersClient {
  public constructor(private readonly context: ClientContext) {}

  /** Orders in every account; `deleted` includes cancelled ones. */
  public async list(
    options: { readonly deleted?: boolean } = {},
    signal?: AbortSignal,
  ): Promise<readonly NordnetOrder[]> {
    const body = await this.context.http.request<readonly NordnetOrder[] | undefined>({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: '/api/2/accounts/orders',
      query: { deleted: options.deleted },
      signal,
    });
    return body ?? [];
  }

  /** Today's trades in every account. */
  public async trades(signal?: AbortSignal): Promise<readonly NordnetTrade[]> {
    const body = await this.context.http.request<readonly NordnetTrade[] | undefined>({
      access: 'required',
      host: 'web',
      method: 'GET',
      path: '/api/2/accounts/trades',
      signal,
    });
    return body ?? [];
  }
}
