import { writable, get } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
import { chain } from "@/config";
import type { WalletId } from "@/typings/types";
import { ConnexUtils } from "@/blockchain/connex-utils";

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

function createStore() {
  const store = writable<State>({ ...initialState });

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
        // VeWorld injects window.vechain which can serve as detection utility.
        if (walletId === "veworld" && !window.vechain) {
          throw new Error("VeWorld is not installed.");
        }

        const connex = new Connex({
          node: chain.rpc[0],
          network: chain.network,
          noExtension: walletId === "sync2",
        });

        const connexUtils = new ConnexUtils(connex);

        console.log({ account });
        // If account is given, it means we are loading user's profile from local storage,
        // i.e., not cert is required.
        if (account != null) {
          console.log("CCOUNT NOT NULL");
          store.set({
            connexUtils,
            loading: false,
            error: undefined,
            connected: true,
            account,
            balance: await connexUtils.fetchBalance(account),
            walletId,
          });

          return account;
        }

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

        const acc = cert.signer as Address;

        store.set({
          connexUtils,
          loading: false,
          error: undefined,
          connected: true,
          account: acc,
          balance: await connexUtils.fetchBalance(acc),
          walletId,
        });

        return acc;
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
      store.set({ ...initialState });
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
