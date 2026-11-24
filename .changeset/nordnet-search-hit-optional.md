---
'@kvant-dev/nordnet': minor
---

`NordnetSearchHit`: `currency`, `display_symbol`, `instrument_group_type`, `instrument_id` and `instrument_type` are now optional. Nordnet leaves them out of non-instrument results (the `SITE`, `BLOG`, `SHAREVILLE_PROFILES`, `SHAREVILLE_GROUPS` and `CURATED_LISTS` groups), so code that reads them needs to handle `undefined`.
