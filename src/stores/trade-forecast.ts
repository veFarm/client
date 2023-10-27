import { writable } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { chain } from "@/config/index";
import { wallet } from "@/stores/wallet";

type ApiResponse = {
  txFee: string;
  solutions: {
    protocolFee: string;
    dexFee: string;
    amountInWithFees: string;
    deltaVET: string;
    stepsCount: number;
    withdrawAmount: string;
    totalProfitVET: string;
  }[];
};

export type Sol = {
  protocolFee: BigNumber;
  dexFee: BigNumber;
  amountInWithFees: BigNumber;
  deltaVET: BigNumber;
  stepsCount: number;
  withdrawAmount: BigNumber;
  totalProfitVET: BigNumber;
};

type State =
  | {
      fetched: true;
      solutions: Sol[];
      txFee: BigNumber;
      loading: boolean;
      error: string | undefined;
    }
  | {
      fetched: false;
      solutions: undefined;
      txFee: undefined;
      loading: boolean;
      error: string | undefined;
    };

const initialState: State = {
  fetched: false,
  solutions: undefined,
  txFee: undefined,
  loading: false,
  error: undefined,
};

/**
 * Fetch trade forecast for the current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update trade forecast store based on wallet store changes.
  wallet.subscribe(async (data) => {
    if (!data.connected) {
      store.set({ ...initialState });
      return;
    }

    // Wallet is connected.
    store.update((s) => ({
      ...s,
      loading: true,
    }));

    try {
      const { account } = data;

      const response = await fetch(
        `${chain.getTradeForecastEndpoint}?account=${account}`,
      );

      const json = (await response.json()) as ApiResponse;

      store.set({
        fetched: true,
        txFee: bn(json.txFee),
        solutions: json.solutions.map((s) => ({
          protocolFee: bn(s.protocolFee),
          dexFee: bn(s.dexFee),
          amountInWithFees: bn(s.amountInWithFees),
          deltaVET: bn(s.deltaVET),
          stepsCount: s.stepsCount,
          withdrawAmount: bn(s.withdrawAmount),
          totalProfitVET: bn(s.totalProfitVET),
        })),
        loading: false,
        error: undefined,
      });
    } catch (error: unknown) {
      store.set({
        ...initialState,
        loading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred.",
      });
    }
  });

  return {
    subscribe: store.subscribe,
  };
}

export const tradeForecast = createStore();
