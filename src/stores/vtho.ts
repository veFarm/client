import { writable, get } from "svelte/store";
import { chain } from "@/config/index";
import type { AbiItem } from "@/typings/types";
import type { ConnexUtils, Contract } from "@/blockchain/connex-utils";
import * as energyArtifact from "@/artifacts/Energy.json";
import { wallet } from "@/stores/wallet";

/**
 * Observation: we use VTHO and Energy interchangeably. They both refer to
 * the same token, which is used on VeChain network to pay for transaction fees.
 */

type State = {
  connexUtils: ConnexUtils | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  allowed: boolean;
  error: string | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  contract: undefined,
  account: undefined,
  allowed: false,
  error: undefined,
};

/**
 * Keeps track of vtho state for the current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update vtho store based on wallet store changes.
  wallet.subscribe(async (data) => {
    // Wallet is NOT connected.
    if (!data.connected) {
      store.set({ ...initialState });
      return;
    }

    // Wallet IS connected.
    try {
      const { connexUtils, account } = data;

      const contract = connexUtils.getContract(
        energyArtifact.abi as AbiItem[],
        chain.vtho,
      );

      const decoded = await contract.methods.constant.allowance(
        account,
        chain.trader,
      );

      store.set({
        connexUtils,
        contract,
        account,
        allowed: decoded[0] !== "0",
        error: undefined,
      });
    } catch (error: unknown) {
      store.update((s) => ({
        ...s,
        error:
          error instanceof Error ? error.message : "Unknown error occurred.",
      }));
    }
  });

  return {
    subscribe: store.subscribe,
    fetchAllowance: async function (): Promise<void> {
      try {
        const data = get(store);

        if (data?.contract == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { contract, account } = data;

        const decoded = await contract.methods.constant.allowance(
          account,
          chain.trader,
        );

        store.update((s) => ({
          ...s,
          allowed: decoded[0] !== "0",
        }));
      } catch (error: unknown) {
        store.update((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        }));
      }
    },
    // TODO: replace with approve/revoke?
    setAllowance: async function (
      /** wei */
      amount: string,
      comment: string,
    ): Promise<void> {
      try {
        const data = get(store);

        if (data?.connexUtils == null || data?.contract == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, contract } = data;

        const response = await contract.methods.signed.approve(
          chain.trader,
          amount,
        )(comment);

        await connexUtils.waitForReceipt(response.txid);
        await this.fetchAllowance();
      } catch (error: unknown) {
        store.update((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
        }));
      }
    },
    // TODO: or getApproveClause
    getClause: function (methodName: string) {
      try {
        const data = get(store);

        if (data?.contract == null) {
          throw new Error("Wallet is not connected.");
        }

        return data.contract.methods.clause[methodName];
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

export const vtho = createStore();
