/** A tough-cookie serialized cookie for www.nordnet.se. */
export interface NordnetCookie {
  readonly creation?: string;
  readonly domain?: string;
  readonly expires?: string;
  readonly extensions?: readonly string[];
  readonly hostOnly?: boolean;
  readonly httpOnly?: boolean;
  readonly key: string;
  readonly lastAccessed?: string;
  readonly maxAge?: number | string;
  readonly path?: string;
  readonly pathIsDefault?: boolean;
  readonly sameSite?: string;
  readonly secure?: boolean;
  readonly value: string;
}

/** Everything needed to resume a login: the www.nordnet.se cookies. API tokens are fetched from them. */
export interface NordnetSession {
  readonly cookies: readonly NordnetCookie[];
  /** Nordnet's customer UUID, from the BankID login. */
  readonly customerId?: string;
}
