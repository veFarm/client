import { writable } from "svelte/store";
import type { WalletId } from "@/typings/types";
import type { ConnexService } from "@/blockchain/connex-service";
import { sync2 } from "@/stores/sync2";

type State = {
  connexService: ConnexService | undefined;
  loading: boolean;
  error: string | undefined;
  connected: boolean;
  account: Address | undefined;
  // chainId: number | undefined;
};

// TODO
// let connex: any;

const initialState: State = {
  connexService: undefined,
  loading: false,
  error: undefined,
  connected: false,
  account: undefined,
  // chainId: undefined,
};

function createStore() {
  const { subscribe, set, update } = writable<State>({ ...initialState });

  let connectedWalletId: WalletId | undefined;

  // Update wallet store based on Sync2 store changes.
  sync2.subscribe(async (data) => {
    // No data present means Sync2 got disconnected.
    if (data == null) {
      set({ ...initialState });
      connectedWalletId = undefined;
      return;
    }

    // Sync2 is connected.
    try {
      set({
        connexService: data.connexService,
        loading: false,
        error: undefined,
        connected: true,
        account: data.account,
        // chainId: network.chainId,
      });
    } catch (error) {
      update((s) => ({
        ...s,
        error: error?.message || "Unknown error occurred.",
      }));
    }
  });

  return {
    subscribe,
    connect: async function (walletId: WalletId): Promise<void> {
      update((s) => ({ ...s, loading: true, error: undefined }));

      try {
        if (walletId !== "sync2") {
          update((s) => ({
            ...s,
            loading: false,
            error: `Ops! ${walletId} has not been integrated yet.`,
          }));
          return;
        }

        if (walletId === "sync2") {
          await sync2.connect();
          connectedWalletId = "sync2";
        }
      } catch (error) {
        update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      } finally {
        update((s) => ({ ...s, loading: false }));
      }
    },
    disconnect: function (): void {
      if (connectedWalletId === "sync2") {
        sync2.disconnect();
      }
    },
    // switchChain: async function (chainId: number): Promise<void> {
    //   update((s) => ({ ...s, loading: true, error: undefined }));

    //   try {
    //     if (connectedWalletId === "metamask") {
    //       await metamask.switchChain(chainId);
    //     }
    //   } catch (error) {
    //     update((s) => ({
    //       ...s,
    //       error: error?.message || "Unknown error occurred.",
    //     }));
    //   } finally {
    //     update((s) => ({ ...s, loading: false }));
    //   }
    // },
  };
}

export const wallet = createStore();
