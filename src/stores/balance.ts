import { writable, get } from "svelte/store";
import type { WrappedConnex, Balance } from "@vearnfi/wrapped-connex";
import { wallet } from "@/stores/wallet";

type State =
  | {
      wConnex: WrappedConnex;
      account: Address;
      current: Balance;
      previous: Balance | undefined;
    }
  | {
      wConnex: undefined;
      account: undefined;
      current: undefined;
      previous: undefined;
    };

const initialState: State = {
  wConnex: undefined,
  account: undefined,
  current: undefined,
  previous: undefined,
};

function createStore() {
  const store = writable<State>({ ...initialState });

  // Update balance store based on wallet store changes.
  wallet.subscribe(async (data) => {
    if (!data.connected) {
      store.set({ ...initialState });
      return;
    }

    // Wallet is connected.
    try {
      const { wConnex, account } = data;

      const balance = await wConnex.fetchBalance(account);

      store.set({
        wConnex,
        account,
        current: balance,
        previous: get(store).current,
      });
    } catch (error: unknown) {
      console.error(error);
      // store.update((s) => ({
      //   ...s,
      //   error:
      //     error instanceof Error ? error.message : "Unknown error occurred.",
      // }));
    }
  });

  return {
    subscribe: store.subscribe,
    fetchBalance: async function () {
      try {
        const data = get(store);

        if (data?.wConnex == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { wConnex, account } = data;

        const balance = await wConnex.fetchBalance(account);

        store.set({
          ...data,
          account,
          current: balance,
          previous: data.current,
        });
      } catch (error) {
        console.error(error);
      }
    },
  };
}

export const balance = createStore();
