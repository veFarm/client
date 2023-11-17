import { writable, get } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
import type BigNumber from "bignumber.js";
import { chain } from "@/config";
import type { WalletId, Balance } from "@/typings/types";
import { ConnexUtils } from "@/blockchain/connex-utils";

type State =
  | {
      connexUtils: ConnexUtils;
      loading: boolean;
      error: string | undefined;
      connected: true;
      account: Address;
      balance: Balance;
      walletId: WalletId;
      baseGasPrice: BigNumber;
    }
  | {
      connexUtils: ConnexUtils | undefined;
      loading: boolean;
      error: string | undefined;
      connected: false;
      account: undefined;
      balance: undefined;
      walletId: WalletId | undefined;
      baseGasPrice: undefined;
    };

const initialState: State = {
  connexUtils: undefined,
  loading: false,
  error: undefined,
  connected: false,
  account: undefined,
  balance: undefined,
  walletId: undefined,
  baseGasPrice: undefined,
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

        const connexUtils = new ConnexUtils(connex);

        const message: Connex.Vendor.CertMessage = {
          purpose: "identification",
          payload: {
            type: "text",
            content: "Sign a certificate to prove your identity.",
          },
        };

        const cert = await connexUtils.signCert(message);

        // This should throw if cert isn't valid.
        Certificate.verify(cert);

        const account = cert.signer as Address;

        // Remember user.
        localStorage.setItem("user", JSON.stringify({ walletId, account }));

        const balance = await connexUtils.fetchBalance(account);

        store.set({
          connexUtils,
          loading: false,
          error: undefined,
          connected: true,
          account,
          balance,
          walletId,
          baseGasPrice: await connexUtils.fetchBaseGasPrice(),
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

        const connexUtils = new ConnexUtils(connex);

        const balance = await connexUtils.fetchBalance(account);

        store.set({
          connexUtils,
          loading: false,
          error: undefined,
          connected: true,
          account,
          balance,
          walletId,
          baseGasPrice: await connexUtils.fetchBaseGasPrice(),
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
     * Fetch user balance (VET and VTHO).
     */
    fetchBalance: async function (): Promise<void> {
      try {
        const data = get(store);

        if (!data.connected) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, account } = data;

        const balance = await connexUtils.fetchBalance(account);

        store.update(() => ({
          ...data,
          balance,
        }));
      } catch (error: unknown) {
        store.update((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        }));
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

        const { connexUtils, account } = data;

        return connexUtils.signTx(clauses, account, comment);
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

        const { connexUtils } = data;

        return connexUtils.waitForReceipt(txId);
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
