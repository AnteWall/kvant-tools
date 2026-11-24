export { NordnetClient, type NordnetClientOptions } from './client.js';
export {
  NordnetAuthenticationError,
  NordnetAuthenticationRequiredError,
  NordnetError,
  NordnetHttpError,
  type NordnetAuthenticationErrorCode,
} from './errors.js';

export type {
  AccountsClient,
  NordnetAccount,
  NordnetAccountInfo,
} from './accounts/accounts-client.js';
export type { AlertsClient, NordnetPriceAlarms } from './alerts/alerts-client.js';
export type {
  AuthClient,
  BankIdAuthAttempt,
  BankIdChallenge,
  BankIdOrder,
  BankIdPollResult,
  SessionCreated,
  SessionVerification,
} from './auth/auth-client.js';
export type { NordnetCookie, NordnetSession } from './auth/session.js';
export type {
  InstrumentsClient,
  NordnetInstrument,
  NordnetTradable,
} from './instruments/instruments-client.js';
export type {
  IsoDate,
  NordnetAmount,
  NordnetDualAmount,
  NordnetLegacyAmount,
} from './internal/amounts.js';
export type { NordnetOrder, NordnetTrade, OrdersClient } from './orders/orders-client.js';
export {
  returnPeriods,
  type NordnetPeriodDevelopment,
  type NordnetPeriodReturn,
  type NordnetReturnGraph,
  type NordnetReturnPoint,
  type NordnetReturnsByYear,
  type NordnetRiskMetrics,
  type PerformanceClient,
  type ReturnPeriod,
} from './performance/performance-client.js';
export type {
  NordnetOwnCapital,
  NordnetOwnCapitalAccount,
  NordnetPosition,
  NordnetPositions,
  NordnetPositionSummary,
  PositionsClient,
} from './positions/positions-client.js';
export type {
  NordnetTransaction,
  TransactionPageOptions,
  TransactionsClient,
} from './transactions/transactions-client.js';
export type {
  NordnetWatchlists,
  NordnetWatchlistSummary,
  WatchlistsClient,
} from './watchlists/watchlists-client.js';
export {
  seriesPeriods,
  type MarketClient,
  type NordnetAmountValue,
  type NordnetArticle,
  type NordnetCompanyEvent,
  type NordnetCompanyProfile,
  type NordnetDividendEvent,
  type NordnetDividends,
  type NordnetExchangeRate,
  type NordnetIndicator,
  type NordnetInstrumentPrice,
  type NordnetKeyFigure,
  type NordnetLastDayReturn,
  type NordnetNewsItem,
  type NordnetNewsPage,
  type NordnetPricePoint,
  type NordnetPriceSeries,
  type NordnetRatings,
  type NordnetSearchGroup,
  type NordnetSearchHit,
  type SeriesPeriod,
} from './market/market-client.js';
