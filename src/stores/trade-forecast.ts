import { writable } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { chain } from "@/config/index";
import { wallet } from "@/stores/wallet";

type State =
  | {
      fetched: true;
      withdrawAmounts: BigNumber[];
      exchangeRate: BigNumber;
      txFee: BigNumber;
      loading: boolean;
      error: string | undefined;
    }
  | {
      fetched: false;
      withdrawAmounts: undefined;
      exchangeRate: undefined;
      txFee: undefined;
      loading: boolean;
      error: string | undefined;
    };

const initialState: State = {
  fetched: false,
  withdrawAmounts: undefined,
  exchangeRate: undefined,
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
        `${chain.getAccountTriggerBalanceEndpoint}?account=${account}`,
      );

      const json = (await response.json()) as {
        withdrawAmounts: string[];
        exchangeRate: string;
        txFee: string;
      };

      store.set({
        fetched: true,
        withdrawAmounts: json.withdrawAmounts.map((v) => bn(v)),
        exchangeRate: bn(json.exchangeRate),
        txFee: bn(json.txFee),
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
