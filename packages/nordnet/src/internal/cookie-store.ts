import { CookieJar, type SerializedCookie, type SerializedCookieJar } from 'tough-cookie';

import type { NordnetCookie } from '../auth/session.js';

export class CookieStore {
  #jar = new CookieJar();

  public constructor(cookies: readonly NordnetCookie[] = []) {
    this.replace(cookies);
  }

  public getHeader(url: URL): string {
    return this.#jar.getCookieStringSync(url.toString());
  }

  public set(cookie: string, url: URL): void {
    this.#jar.setCookieSync(cookie, url.toString());
  }

  public absorb(headers: Headers, url: URL): boolean {
    const setCookies = headers.getSetCookie();

    for (const cookie of setCookies) {
      this.set(cookie, url);
    }

    return setCookies.length > 0;
  }

  public replace(cookies: readonly NordnetCookie[]): void {
    const activeCookies = cookies.filter(isActiveCookie);
    if (activeCookies.length === 0) {
      this.#jar = new CookieJar();
      return;
    }

    const serialized: SerializedCookieJar = {
      cookies: structuredClone(activeCookies) as SerializedCookie[],
      rejectPublicSuffixes: true,
      storeType: 'MemoryCookieStore',
      version: 'tough-cookie@6',
    };
    this.#jar = CookieJar.deserializeSync(serialized);
  }

  public serialize(): readonly NordnetCookie[] {
    const serialized = this.#jar.serializeSync();
    return serialized === undefined
      ? []
      : (structuredClone(serialized.cookies.filter(isActiveCookie)) as NordnetCookie[]);
  }
}

function isActiveCookie(cookie: NordnetCookie | SerializedCookie): boolean {
  return (
    typeof cookie.key === 'string' &&
    typeof cookie.value === 'string' &&
    cookie.maxAge !== 0 &&
    cookie.maxAge !== '0'
  );
}
