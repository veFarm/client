import { writable, get } from "svelte/store";
import type { AbiItem } from "@/typings/types";
import type { ConnexUtils, Contract } from "@/blockchain/connex-utils";
import * as vthoArtifact from "@/abis/VTHO.json";
import { getEnvVars } from "@/utils/get-env-vars";
import { formatUnits } from "@/utils/format-units";
import { wallet } from "@/stores/wallet";
import { VTHO_DECIMALS } from "@/config";

type State = {
  connexUtils: ConnexUtils | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  allowance: string;
  error: string | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  contract: undefined,
  account: undefined,
  allowance: "0",
  error: undefined,
};

const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

/**
 * Keeps track of vtho state for the current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update vtho store based on wallet store changes.
  wallet.subscribe(async (data) => {
    // No connex present means wallet is disconnected.
    if (data.connexUtils == null) {
      store.set({ ...initialState });
      return;
    }

    // wallet is connected.
    try {
      const { connexUtils, account } = data;

      const contract = connexUtils.getContract(
        vthoArtifact.abi as AbiItem[],
        VTHO_CONTRACT_ADDRESS,
      );

      const decoded = await contract.methods.constant.allowance([
        account,
        TRADER_CONTRACT_ADDRESS,
      ]);

      store.set({
        connexUtils,
        contract,
        account,
        allowance: formatUnits(decoded[0], VTHO_DECIMALS),
        error: undefined,
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
    fetchAllowance: async function (): Promise<void> {
      try {
        const data = get(store);

        if (data?.contract == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { contract, account } = data;

        const decoded = await contract.methods.constant.allowance([
          account,
          TRADER_CONTRACT_ADDRESS,
        ]);

        store.update((s) => ({
          ...s,
          allowance: formatUnits(decoded[0], VTHO_DECIMALS),
        }));
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    setAllowance: async function (
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
          [TRADER_CONTRACT_ADDRESS, amount],
          comment,
        );

        await connexUtils.waitForReceipt(response.txid);
        await this.fetchAllowance();
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    getClause: function (methodName: string) {
      try {
        const data = get(store);

        if (data?.contract == null) {
          throw new Error("Wallet is not connected.");
        }

        return data.contract.methods.clause[methodName];
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
  };
}

export const vtho = createStore();
