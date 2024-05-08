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

      const current = await wConnex.fetchBalance(account);
      const previous = get(store).current;

      store.set({
        wConnex,
        account,
        current,
        previous,
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
        const walletData = get(wallet);
        const balanceData = get(store);

        if (walletData?.wConnex == null || walletData?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { wConnex, account } = walletData;

        const current = await wConnex.fetchBalance(account);
        const previous = balanceData.current;

        store.set({
          ...walletData,
          account,
          current,
          previous,
        });
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Checks whether or not the VET balance has been updated.
     */
    didUpdate: function (
      current: Balance | undefined,
      previous: Balance | undefined,
    ): boolean {
      if (current?.vet != null && previous?.vet == null) {
        return true;
      }

      if (
        current?.vet != null &&
        previous?.vet != null &&
        !current.vet.eq(previous.vet)
      ) {
        return true;
      }

      return false;
    },
  };
}

export const balance = createStore();
