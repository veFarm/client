import type { BigNumber } from "bignumber.js";

export type ChainId = 100009 | 100010 | 100011;
// ^ 100009 = production, 100010 = staging, 100011 = development

export type WalletId = "sync2" | "veworld";

export type AbiType =
  | "function"
  | "constructor"
  | "event"
  | "fallback"
  | "receive";

export type StateMutabilityType = "pure" | "view" | "nonpayable" | "payable";

export type AbiItem = {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: AbiInput[];
  name?: string;
  outputs?: AbiOutput[];
  payable?: boolean;
  stateMutability?: StateMutabilityType;
  type: AbiType;
  gas?: number;
};

export type AbiInput = {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiInput[];
  internalType?: string;
};

export type AbiOutput = {
  name: string;
  type: string;
  components?: AbiOutput[];
  internalType?: string;
};

export type SwapConfig = {
  reserveBalance: string;
  triggerBalance: string;
};

export type Balance = {
  vet: BigNumber;
  vtho: BigNumber;
};
