/** An amount from the cloud API (api.prod.nntech.io). */
export interface NordnetAmount {
  readonly currencyCode: string;
  readonly value: number;
}

/** An amount from the legacy `/api/2` endpoints. */
export interface NordnetLegacyAmount {
  readonly currency: string;
  readonly value: number;
}

/** An amount in both the account's and the instrument's currency. */
export interface NordnetDualAmount {
  readonly inAccountCurrency: NordnetAmount;
  readonly inInstrumentCurrency?: NordnetAmount;
}

/** `YYYY-MM-DD`, as the date-range endpoints want it. */
export type IsoDate = string;
