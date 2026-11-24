# @kvant-dev/nordnet

## 0.2.0

### Minor Changes

- e8f5616: `NordnetSearchHit`: `currency`, `display_symbol`, `instrument_group_type`, `instrument_id` and `instrument_type` are now optional. Nordnet leaves them out of non-instrument results (the `SITE`, `BLOG`, `SHAREVILLE_PROFILES`, `SHAREVILLE_GROUPS` and `CURATED_LISTS` groups), so code that reads them needs to handle `undefined`.

## 0.1.1

### Patch Changes

- e2b3f12: Link the package README to the new Nordnet documentation at antewall.github.io/kvant-tools, and list the `market` client's calls. First release published from CI.

## 0.1.0

### Minor Changes

- First release: an unofficial TypeScript SDK for the web API behind nordnet.se. Log in with BankID by QR code, then read accounts, positions, performance, transactions, orders, watchlists, price alarms, instruments, and market data (search, prices, price series, news, ratings, dividends, and company data).
