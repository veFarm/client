import { writable } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { chain } from "@/config/index";
import { balance } from "@/stores/balance";

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
      account: Address;
      solutions: Sol[];
      txFee: BigNumber;
      loading: boolean;
      error: string | undefined;
    }
  | {
      fetched: false;
      account: undefined;
      solutions: undefined;
      txFee: undefined;
      loading: boolean;
      error: string | undefined;
    };

const initialState: State = {
  fetched: false,
  account: undefined,
  solutions: undefined,
  txFee: undefined,
  loading: false,
  error: undefined,
};

/**
 * Fetch trade forecast for the given account.
 * @param {Address} account Target account.
 * @return {{txFee: BigNumber, solutions: Sol[]}}
 */
async function fetchTradeForecast(
  account: Address,
): Promise<{ solutions: Sol[]; txFee: BigNumber }> {
  const response = await fetch(
    `${chain.getTradeForecastEndpoint}?account=${account}`,
  );

  const json = (await response.json()) as ApiResponse;

  return {
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
  };
}

/**
 * Fetch trade forecast for the current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update trade forecast store based on balance store changes.
  balance.subscribe(async (data) => {
    if (!data.account) {
      store.set({ ...initialState });
      return;
    }

    // Wallet is connected.
    try {
      const { account, current, previous } = data;

      // In case VET balance is unchanged, do not fetch again.
      if (current?.vet != null && previous?.vet != null && current.vet.eq(previous.vet)) {
        console.log("VET balance did not change")
        return
      }

    store.update((s) => ({
      ...s,
      loading: true,
    }));

      console.log("FETCH!")

      const { txFee, solutions } = await fetchTradeForecast(account);

      store.set({
        fetched: true,
        account,
        txFee,
        solutions,
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
    // fetchTradeForecast: async function (): Promise<void> {
    //   try {
    //     const data = get(store);

    //     if (data?.account == null) {
    //       throw new Error("balance is not connected.");
    //     }

    //     const { account } = data;

    //     const { txFee, solutions } = await fetchTradeForecast(account);

    //     store.set({
    //       fetched: true,
    //       account,
    //       txFee,
    //       solutions,
    //       loading: false,
    //       error: undefined,
    //     });
    //   } catch (error: unknown) {
    //     store.update((s) => ({
    //       ...s,
    //       error:
    //         error instanceof Error ? error.message : "Unknown error occurred.",
    //     }));
    //   }
    // },
  };
}

export const tradeForecast = createStore();
