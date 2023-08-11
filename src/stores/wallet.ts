import { writable, get } from "svelte/store";
// import type { Connex } from "@vechain/connex";
import type { WalletId } from "@/typings/types";
import type { ConnexUtils } from "@/blockchain/connex-utils";
import { sync2 } from "@/stores/sync2";

type State = {
  connexUtils: ConnexUtils | undefined;
  loading: boolean;
  error: string | undefined;
  connected: boolean;
  account: Address | undefined;
  balance: { vet: string; vtho: string } | undefined;
  walletId: WalletId | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  loading: false,
  error: undefined,
  connected: false,
  account: undefined,
  balance: undefined,
  walletId: undefined,
};

function createStore() {
  const store = writable<State>({ ...initialState });

  // Update wallet store based on Sync2 store changes.
  sync2.subscribe(async (data) => {
    // No data present means Sync2 is disconnected.
    if (data == null) {
      store.set({ ...initialState });
      return;
    }

    // Sync2 is connected.
    // TODO: store on localstore
    try {
      const { connexUtils, account } = data;

      store.set({
        connexUtils,
        loading: false,
        error: undefined,
        connected: true,
        account,
        balance: await connexUtils.fetchBalance(account),
        walletId: "sync2",
      });
    } catch (error) {
      store.update((s) => ({
        ...s,
        error: error?.message || "Unknown error occurred.",
      }));
    }
  });

  return {
    subscribe: store.subscribe,
    connect: async function (walletId: WalletId): Promise<void> {
      store.update((s) => ({
        ...s,
        loading: true,
        error: undefined,
        walletId,
      }));

      try {
        if (walletId !== "sync2") {
          throw new Error(`Ops! ${walletId} has not been integrated yet.`);
        }

        if (walletId === "sync2") {
          await sync2.connect();
        }
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
          walletId: undefined,
        }));
      } finally {
        store.update((s) => ({ ...s, loading: false }));
      }
    },
    disconnect: function (): void {
      const data = get(store);

      // TODO: clear localStorage
      if (data.walletId === "sync2") {
        sync2.disconnect();
      }
    },
    fetchBalance: async function (): Promise<void> {
      try {
        const data = get(store);

        if (data?.connexUtils == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, account } = data;

        const balance = await connexUtils.fetchBalance(account);

        store.update((s) => ({
          ...s,
          balance,
        }));
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
  };
}

export const wallet = createStore();
