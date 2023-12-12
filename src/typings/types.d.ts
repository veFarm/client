/// <reference types="svelte" />

import type { BigNumber } from "bignumber.js";

export type WalletId = "sync2" | "veworld";

export type Balance = {
  vet: BigNumber;
  vtho: BigNumber;
};
