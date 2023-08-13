import { writable, get } from "svelte/store";
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

// Observation: not sure if this is the best abstraction for handling
// wallet related logic.
// TODO: move sync2 store code into wallet store and integrate VeWorld wallet.

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
    connect: async function (
      walletId: WalletId,
      account?: Address,
    ): Promise<Address | undefined> {
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
          return await sync2.connect(account);
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
    signTx: async function (
      clauses: Connex.VM.Clause[],
      comment: string,
    ): Promise<Connex.Vendor.TxResponse | undefined> {
      try {
        const data = get(store);

        if (data?.connexUtils == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, account } = data;

        return connexUtils.signTx(clauses, account, comment);
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    waitForReceipt: async function (
      txId: string,
    ): Promise<Connex.Thor.Transaction.Receipt | undefined> {
      try {
        const data = get(store);

        if (data?.connexUtils == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils } = data;

        return connexUtils.waitForReceipt(txId);
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
