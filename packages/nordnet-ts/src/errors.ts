export class NordnetError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class NordnetAuthenticationRequiredError extends NordnetError {
  public constructor() {
    super('This request requires an authenticated Nordnet session.');
  }
}

export type NordnetAuthenticationErrorCode = 'cancelled' | 'malformed_response' | 'protocol';

export class NordnetAuthenticationError extends NordnetError {
  public readonly code: NordnetAuthenticationErrorCode;

  public constructor(code: NordnetAuthenticationErrorCode, options?: ErrorOptions) {
    super(`Nordnet authentication failed: ${code}.`, options);
    this.code = code;
  }
}

export interface NordnetHttpErrorOptions {
  readonly body: unknown;
  readonly method?: string;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
}

export class NordnetHttpError extends NordnetError {
  public readonly body: unknown;
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;

  public constructor(options: NordnetHttpErrorOptions) {
    const suffix = options.statusText ? ` ${options.statusText}` : '';
    // Which call and Nordnet's own reason: a bare status is hard to act on in a report.
    const call = [options.method, pathOf(options.url)].filter(Boolean).join(' ');
    const reason = reasonOf(options.body);
    super(
      `Nordnet request ${call ? `${call} ` : ''}failed with status ${options.status}${suffix}` +
        `${reason ? `: ${reason}` : ''}.`,
    );
    this.body = options.body;
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
  }
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

/** Nordnet's error text (`message`, `error`, `code`), or a short raw body. */
function reasonOf(body: unknown): string {
  if (typeof body === 'string') return body.slice(0, 200);
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    const text = [b.message, b.error, b.code, b.error_description].find(
      (v) => typeof v === 'string',
    );
    return typeof text === 'string' ? text.slice(0, 200) : JSON.stringify(body).slice(0, 200);
  }
  return '';
}
