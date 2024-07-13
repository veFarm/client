import { writable } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { chain } from "@/config/index";
import { balance } from "@/stores/balance";

type ApiResponse = {
  txFee: string;
  reserveIn: string;
  reserveOut: string;
  solutions: {
    protocolFee: string;
    dexFee: string;
    amountInWithFees: string;
    deltaVET: string;
    stepsCount: number;
    withdrawAmount: string;
    totalProfitVET: string;
  }[];
} | null;

export type Sol = {
  protocolFee: BigNumber;
  dexFee: BigNumber;
  amountInWithFees: BigNumber;
  deltaVET: BigNumber;
  stepsCount: number;
  withdrawAmount: BigNumber;
  totalProfitVET: BigNumber;
};

type TradesForecast = {
  txFee: BigNumber;
  reserveIn: BigNumber;
  reserveOut: BigNumber;
  solutions: Sol[];
};

type State =
  | {
      fetched: true;
      account: Address;
      txFee: BigNumber;
      reserveIn: BigNumber;
      reserveOut: BigNumber;
      solutions: Sol[];
      loading: boolean;
      error: string | undefined;
      isOpen: Record<number, boolean>;
    }
  | {
      fetched: false;
      account: undefined;
      txFee: undefined;
      reserveIn: undefined;
      reserveOut: undefined;
      solutions: undefined;
      loading: boolean;
      error: string | undefined;
      isOpen: Record<number, boolean>;
    };

const initialState: State = {
  fetched: false,
  account: undefined,
  txFee: undefined,
  reserveIn: undefined,
  reserveOut: undefined,
  solutions: undefined,
  loading: false,
  error: undefined,
  isOpen: { 0: false, 1: false },
};

/**
 * Fetch trades forecast for the given account.
 * @param {Address} account Target account.
 * @return {{txFee: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber, solutions: Sol[]}}
 */
async function fetchTradesForecast(
  account: Address,
  vetBalance: BigNumber,
): Promise<TradesForecast> {
  const response = await fetch(
    `${
      chain.getTradesForecastEndpoint
    }?account=${account}&vet=${vetBalance.toFixed()}`,
  );

  const json = (await response.json()) as ApiResponse;

  if (json == null || json?.solutions == null) {
    return {
      txFee: bn(0),
      reserveIn: bn(0),
      reserveOut: bn(0),
      solutions: [],
    };
  }

  return {
    txFee: bn(json.txFee),
    reserveIn: bn(json.reserveIn),
    reserveOut: bn(json.reserveOut),
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
 * Fetch trades forecast for the current logged in account.
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

      // In case VET balance hasn't been updated, do not fetch again.
      if (!balance.didUpdate(current, previous)) return;

      store.update((s) => ({
        ...s,
        loading: true,
      }));

      let tradesForecast: TradesForecast;

      tradesForecast = await fetchTradesForecast(account, current.vet);

      // Force a refetch in case no solutions were found.
      if (current.vet.gt(bn(0)) && tradesForecast.solutions.length === 0) {
        tradesForecast = await fetchTradesForecast(account, current.vet);
      }

      if (current.vet.gt(bn(0)) && tradesForecast.solutions.length === 0) {
        throw new Error(
          "An optimized strategy could not be calculated. Your VET balance is likely too low.",
        );
      }

      store.update((s) => ({
        ...s,
        fetched: true,
        account,
        txFee: tradesForecast.txFee,
        reserveIn: tradesForecast.reserveIn,
        reserveOut: tradesForecast.reserveOut,
        solutions: tradesForecast.solutions,
        loading: false,
        error: undefined,
      }));
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
    toggle: function (index: number): void {
      store.update((s) => ({
        ...s,
        isOpen: { ...s.isOpen, [index]: !s.isOpen[index] },
      }));
    },
  };
}

export const tradesForecast = createStore();
