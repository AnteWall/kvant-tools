import type { NordnetSession } from '../auth/session.js';
import type { HttpClient } from './http-client.js';

export interface SessionController {
  clear(): void;
  get(): NordnetSession | undefined;
  set(session: NordnetSession): void;
}

export interface ClientContext {
  readonly http: HttpClient;
  readonly session: SessionController;
}

/** Account ids in the order nordnet.se sends them; the backend caches on the request body. */
export function sortedIds(ids: readonly string[]): string[] {
  // oxlint-disable-next-line no-array-sort -- sorts a copy; toSorted is not in the ES2022 lib
  return [...ids].sort();
}
