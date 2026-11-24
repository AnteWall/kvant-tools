import type { NordnetCookie, NordnetSession } from '../auth/session.js';
import { NordnetAuthenticationRequiredError, NordnetHttpError } from '../errors.js';
import { CookieStore } from './cookie-store.js';

const DEFAULT_WEB_BASE_URL = 'https://www.nordnet.se/';
const DEFAULT_API_BASE_URL = 'https://api.prod.nntech.io/';
const TOKEN_PATH = '/nnxapi/authorization/v1/tokens';
/** How long nordnet.se itself reuses an API token before fetching a new one. */
const TOKEN_TTL_MS = 25_000;

/**
 * `web` is www.nordnet.se: the legacy `/api/2` and `/nnxapi` endpoints, authenticated by session
 * cookies plus the rolling `ntag` header. `api` is Nordnet's cloud API: bearer tokens minted
 * from the web session.
 */
export type Host = 'api' | 'web';

export type AccessMode = 'anonymous' | 'required';

export type HttpMethod = 'DELETE' | 'GET' | 'POST';

export interface HttpRequest {
  readonly access: AccessMode;
  readonly body?: unknown;
  readonly host: Host;
  readonly method: HttpMethod;
  readonly path: string;
  readonly query?: Readonly<Record<string, boolean | number | string | undefined>>;
  readonly signal?: AbortSignal | undefined;
}

export interface HttpClientOptions {
  readonly apiBaseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly getSession: () => NordnetSession | undefined;
  readonly locale?: string;
  readonly updateSession?: (session: NordnetSession) => void;
  readonly webBaseUrl?: string;
}

export class HttpClient {
  readonly #api: URL;
  readonly #cookies = new CookieStore();
  readonly #fetch: typeof globalThis.fetch;
  readonly #getSession: () => NordnetSession | undefined;
  readonly #locale: string;
  readonly #updateSession: ((session: NordnetSession) => void) | undefined;
  readonly #web: URL;
  #loadedSession: NordnetSession | undefined;
  #ntag = '';
  #token: Promise<string> | undefined;
  #tokenFetchedAt = 0;

  public constructor(options: HttpClientOptions) {
    this.#api = baseUrl(options.apiBaseUrl ?? DEFAULT_API_BASE_URL);
    this.#web = baseUrl(options.webBaseUrl ?? DEFAULT_WEB_BASE_URL);
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#getSession = options.getSession;
    this.#locale = options.locale ?? 'sv-SE';
    this.#updateSession = options.updateSession;
  }

  /** The www.nordnet.se cookies, including those set during a login that has no session yet. */
  public get cookies(): readonly NordnetCookie[] {
    return this.#cookies.serialize();
  }

  public resetCookies(): void {
    this.#cookies.replace([]);
    this.#ntag = '';
    this.#token = undefined;
  }

  public async request<Response>(request: HttpRequest): Promise<Response> {
    const session = this.#syncSession();
    if (request.access === 'required' && session === undefined) {
      throw new NordnetAuthenticationRequiredError();
    }

    let response = await this.#send(request);
    if (response.status === 401 && request.host === 'api' && request.access === 'required') {
      // The token outlived the server's patience; mint a new one once.
      this.#token = undefined;
      response = await this.#send(request);
    }

    const body = await parseBody(response);
    if (!response.ok) {
      throw new NordnetHttpError({
        body,
        method: request.method,
        status: response.status,
        statusText: response.statusText,
        url: response.url || this.#url(request).toString(),
      });
    }
    return body as Response;
  }

  async #send(request: HttpRequest): Promise<Response> {
    const url = this.#url(request);

    const headers = new Headers({ Accept: 'application/json' });
    if (request.body !== undefined) headers.set('Content-Type', 'application/json');
    if (request.host === 'web') {
      headers.set('client-id', 'NEXT');
      if (this.#ntag) headers.set('ntag', this.#ntag);
      // The token endpoint answers 400 without a `lang` cookie, which a browser has from its
      // first page load; outside one nothing sets it.
      const cookie = this.#cookies.getHeader(url);
      const lang = /(^|; )lang=/.test(cookie) ? '' : `lang=${this.#locale.slice(0, 2)}`;
      headers.set('Cookie', [lang, cookie].filter(Boolean).join('; '));
    } else {
      headers.set('x-locale', this.#locale);
      if (request.access === 'required') {
        headers.set('Authorization', `Bearer ${await this.#apiToken()}`);
      }
    }

    const init: RequestInit = { headers, method: request.method };
    if (request.body !== undefined) init.body = JSON.stringify(request.body);
    if (request.signal !== undefined) init.signal = request.signal;

    const response = await this.#fetch(url, init);
    if (request.host === 'web') {
      this.#ntag = response.headers.get('ntag') ?? this.#ntag;
      if (this.#cookies.absorb(response.headers, url)) this.#persistCookies();
    }
    return response;
  }

  #url(request: HttpRequest): URL {
    const url = new URL(
      request.path.replace(/^\/+/, ''),
      request.host === 'web' ? this.#web : this.#api,
    );
    for (const [key, value] of Object.entries(request.query ?? {})) {
      if (value !== undefined) url.searchParams.append(key, String(value));
    }
    return url;
  }

  #apiToken(): Promise<string> {
    if (this.#token === undefined || Date.now() - this.#tokenFetchedAt > TOKEN_TTL_MS) {
      this.#tokenFetchedAt = Date.now();
      const token = this.request<{ readonly jwt: string }>({
        access: 'required',
        body: {},
        host: 'web',
        method: 'POST',
        path: TOKEN_PATH,
      }).then(({ jwt }) => jwt);
      // A failed mint must not be cached for the next caller.
      token.catch(() => {
        if (this.#token === token) this.#token = undefined;
      });
      this.#token = token;
    }
    return this.#token;
  }

  /** Loads the jar from the session whenever the session object is swapped from outside. */
  #syncSession(): NordnetSession | undefined {
    const session = this.#getSession();
    if (session !== this.#loadedSession) {
      if (session !== undefined || this.#loadedSession !== undefined) {
        this.#cookies.replace(session?.cookies ?? []);
        this.#ntag = '';
        this.#token = undefined;
      }
      this.#loadedSession = session;
    }
    return session;
  }

  #persistCookies(): void {
    const session = this.#getSession();
    if (session === undefined) return;
    const updated: NordnetSession = { ...session, cookies: this.#cookies.serialize() };
    this.#loadedSession = updated;
    this.#updateSession?.(updated);
  }
}

function baseUrl(value: string): URL {
  return new URL(value.endsWith('/') ? value : `${value}/`);
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;
  const text = await response.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
