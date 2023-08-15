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

export type SwapDoc = {
  account: Address;
  withdrawAmount: string;
  amountOut: string;
  txId: string;
  blockTimestamp: number;
};

export type Stats = {
  /** Number of registered accounts */
  accountsCount: number;
  /** Number of swap operations performed by the protocol */
  swapsCount: number;
  /** Total VET amount transacted by the protocol */
  vetTotal: string;
  /** Total VTHO amount transacted by the protocol */
  vthoTotal: string;
};

export type SwapConfig = {
  triggerBalance: string;
  reserveBalance: string;
};
