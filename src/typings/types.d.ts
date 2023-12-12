/// <reference types="svelte" />

import type { BigNumber } from "bignumber.js";

export type ChainId = 100009 | 100010 | 100011;
// ^ 100009 = production, 100010 = staging, 100011 = development

export type WalletId = "sync2" | "veworld";

export type Balance = {
  vet: BigNumber;
  vtho: BigNumber;
};
