import { writable, get } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
// import type { BigNumber } from "bignumber.js";
import { wrapConnex } from "@vearnfi/wrapped-connex";
import type { WrappedConnex } from "@vearnfi/wrapped-connex";
import { chain } from "@/config";
import type { WalletId } from "@/typings/types";

type State =
  | {
      wConnex: WrappedConnex;
      loading: boolean;
      error: string | undefined;
      connected: true;
      account: Address;
      walletId: WalletId;
      // baseGasPrice: BigNumber;
    }
  | {
      wConnex: WrappedConnex | undefined;
      loading: boolean;
      error: string | undefined;
      connected: false;
      account: undefined;
      walletId: WalletId | undefined;
      // baseGasPrice: undefined;
    };

const initialState: State = {
  wConnex: undefined,
  loading: false,
  error: undefined,
  connected: false,
  account: undefined,
  walletId: undefined,
  // baseGasPrice: undefined,
};

function createStore() {
  const store = writable<State>({ ...initialState });

  return {
    subscribe: store.subscribe,
    disconnect: function (): void {
      store.set({ ...initialState });

      // Forget user data.
      localStorage.removeItem("user");
    },
    /**
     * Request user signature.
     * @param {WalletId} walletId Wallet id.
     */
    connect: async function (walletId: WalletId): Promise<void> {
      try {
        store.set({ ...initialState });

        store.update((s) => ({
          ...s,
          loading: true,
          walletId,
        }));

        // VeWorld injects window.vechain which can serve as detection utility.
        if (walletId === "veworld" && !window.vechain) {
          throw new Error("VeWorld extension not detected.");
        }

        const connex = new Connex({
          node: chain.rpc[0],
          network: chain.network,
          noExtension: walletId === "sync2",
        });

        const wConnex = wrapConnex(connex);

        const message: Connex.Vendor.CertMessage = {
          purpose: "identification",
          payload: {
            type: "text",
            content: "Sign a certificate to prove your identity.",
          },
        };

        const cert = await wConnex.signCert(message);

        // This should throw if cert isn't valid.
        Certificate.verify(cert);

        const account = cert.signer as Address;

        // Remember user.
        localStorage.setItem("user", JSON.stringify({ walletId, account }));

        store.set({
          wConnex,
          loading: false,
          error: undefined,
          connected: true,
          account,
          walletId,
          // baseGasPrice: await wConnex.fetchBaseGasPrice(),
        });
      } catch (error: unknown) {
        store.set({
          ...initialState,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        });
      } finally {
        store.update((s) => ({ ...s, loading: false }));
      }
    },
    /**
     * Load user account from localStorage if any.
     */
    loadStoredAccount: async function (): Promise<void> {
      try {
        store.set({ ...initialState });

        const user = localStorage.getItem("user"); // "{"walletId": "sync2", "account": "0x"}"

        if (user == null) return;

        const { walletId, account } = JSON.parse(user) as {
          walletId: WalletId;
          account: Address;
        };

        store.update((s) => ({
          ...s,
          loading: true,
          walletId,
        }));

        const connex = new Connex({
          node: chain.rpc[0],
          network: chain.network,
          noExtension: walletId === "sync2",
        });

        const wConnex = wrapConnex(connex);

        store.set({
          wConnex,
          loading: false,
          error: undefined,
          connected: true,
          account,
          walletId,
          // baseGasPrice: await wConnex.fetchBaseGasPrice(),
        });
      } catch (error: unknown) {
        store.set({
          ...initialState,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        });
      } finally {
        store.update((s) => ({ ...s, loading: false }));
      }
    },
    signTx: async function (
      clauses: Connex.VM.Clause[],
      comment: string,
    ): Promise<Connex.Vendor.TxResponse | undefined> {
      try {
        const data = get(store);

        if (!data.connected) {
          throw new Error("Wallet is not connected.");
        }

        const { wConnex, account } = data;

        return wConnex.signTx(clauses, account, comment);
      } catch (error: unknown) {
        store.update((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        }));
      }
    },
    waitForReceipt: async function (
      txId: string,
    ): Promise<Connex.Thor.Transaction.Receipt | undefined> {
      try {
        const data = get(store);

        if (!data.connected) {
          throw new Error("Wallet is not connected.");
        }

        const { wConnex } = data;

        return wConnex.waitForReceipt(txId);
      } catch (error: unknown) {
        store.update((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        }));
      }
    },
  };
}

export const wallet = createStore();
