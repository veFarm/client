import { writable, get } from "svelte/store";
import type { Connex } from "@vechain/connex";
import type { WalletId } from "@/typings/types";
import { ConnexUtils } from "@/blockchain/connex-utils";
import { sync2 } from "@/stores/sync2";

type State = {
  connex: Connex | undefined;
  loading: boolean;
  error: string | undefined;
  connected: boolean;
  account: Address | undefined;
  balance: { vet: string; vtho: string } | undefined;
};

const initialState: State = {
  connex: undefined,
  loading: false,
  error: undefined,
  connected: false,
  account: undefined,
  balance: undefined,
};

function createStore() {
  const store = writable<State>({ ...initialState });

  let connectedWalletId: WalletId | undefined;

  // Update wallet store based on Sync2 store changes.
  sync2.subscribe(async (data) => {
    // No data present means Sync2 got disconnected.
    if (data == null) {
      store.set({ ...initialState });
      connectedWalletId = undefined;
      return;
    }

    // Sync2 is connected.
    try {
      const { connex, account } = data;
      const connexUtils = new ConnexUtils(connex);

      store.set({
        connex,
        loading: false,
        error: undefined,
        connected: true,
        account,
        balance: await connexUtils.fetchBalance(account),
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
      store.update((s) => ({ ...s, loading: true, error: undefined }));

      try {
        if (walletId !== "sync2") {
          throw new Error(`Ops! ${walletId} has not been integrated yet.`);
        }

        if (walletId === "sync2") {
          await sync2.connect();
          connectedWalletId = "sync2";
        }
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      } finally {
        store.update((s) => ({ ...s, loading: false }));
      }
    },
    disconnect: function (): void {
      // TODO: can't we store the id inside the store itself or
      // add a reference to the connected store like
      // store.connectedWallet = sync2
      // then we do store.connectedWallet.disconnect()
      // TODO: clear localStorage
      if (connectedWalletId === "sync2") {
        sync2.disconnect();
      }
    },
    refetchBalance: async function (): Promise<void> {
      try {
        const data = get(store);

        if (data?.connex == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connex, account } = data;

        const connexUtils = new ConnexUtils(connex);

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
