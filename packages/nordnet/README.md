# @kvant-dev/nordnet

Unofficial, ESM-first TypeScript SDK for the web API behind nordnet.se: the same calls Nordnet's
own web app makes, not the official External API.

**Documentation:** [Getting started](https://antewall.github.io/kvant-tools/docs/nordnet/getting-started) · [Authentication](https://antewall.github.io/kvant-tools/docs/nordnet/authentication) · [API reference](https://antewall.github.io/kvant-tools/docs/nordnet/reference)

## Disclaimer

This SDK is not affiliated with Nordnet Bank AB. The API is undocumented and can change or
disappear without warning. The author is not responsible for any damages from using it.

## Login

Nordnet's web API sits on two hosts. `www.nordnet.se` (`/api/2`, `/nnxapi`) authenticates with
session cookies. `api.prod.nntech.io` takes short-lived bearer tokens that the client mints from
that session. A `NordnetSession` is just those cookies, so persist `client.session` after calls.

```ts
import { NordnetClient } from '@kvant-dev/nordnet';

const client = new NordnetClient();
const attempt = await client.auth.startBankId();
for (;;) {
  render(attempt.challenge.qrPayload); // a new QR code every poll
  await new Promise((r) => setTimeout(r, attempt.challenge.refreshAfterMs));
  const result = await attempt.poll();
  if (result.status === 'pending') continue;
  if (result.status !== 'complete') throw new Error(result.status);
  save(result.session);
  break;
}
```

Later: `new NordnetClient({ session })`, then `await client.auth.validateSession()`.

## Calls

| Client         | Calls                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `accounts`     | `list()`, `info(accids)`                                                                           |
| `positions`    | `list(accountIds)`, `ownCapital(accountIds)`                                                       |
| `performance`  | `graph(accountIds, range)`, `development(accountIds, period)`, `riskMetrics`, `returnsByYear`      |
| `transactions` | `page({ accountIds, fromDate, toDate, … })`                                                        |
| `watchlists`   | `list()`, `get(id)`                                                                                |
| `alerts`       | `priceAlarms()`                                                                                    |
| `orders`       | `list()`, `trades()`                                                                               |
| `instruments`  | `get(ids)`, `byIsin(isin, currency, marketId)`                                                     |
| `market`       | `search(query)`, `prices(ids)`, `series(id, period)`, `news(id)`, `dividends(id)`, company data, … |

Legacy calls take an account's integer `accid`; cloud calls take its UUID `account_id`. Both
come from `accounts.list()`.

Not verified yet: the item shapes of positions, transactions, orders, trades, alarms and a
watchlist's contents. Their types come from nordnet.se's frontend code, not a recorded response.
