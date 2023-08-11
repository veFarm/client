import { writable, get } from "svelte/store";
import type { AbiItem } from "@/typings/types";
import type { ConnexUtils, Contract } from "@/blockchain/connex-utils";
import * as traderArtifact from "@/abis/Trader.json";
import { getEnvVars } from "@/utils/get-env-vars";
import { formatUnits } from "@/utils/format-units";
import { parseUnits } from "@/utils/parse-units";
import { wallet } from "@/stores/wallet";
import { VTHO_DECIMALS } from "@/config";

type State = {
  connexUtils: ConnexUtils | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  triggerBalance: string;
  reserveBalance: string;
  error: string | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  contract: undefined,
  account: undefined,
  triggerBalance: "0",
  reserveBalance: "0",
  error: undefined,
};

const { TRADER_CONTRACT_ADDRESS } = getEnvVars();

/**
 * Keeps track of trader state for the current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update trader store based on wallet store changes.
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
        traderArtifact.abi as AbiItem[],
        TRADER_CONTRACT_ADDRESS,
      );

      const decoded = await contract.methods.constant.addressToConfig(
        [account],
      );

      store.set({
        connexUtils,
        contract,
        account,
        triggerBalance: formatUnits(decoded[0], VTHO_DECIMALS),
        reserveBalance: formatUnits(decoded[1], VTHO_DECIMALS),
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
    fetchConfig: async function (): Promise<void> {
      try {
        const data = get(store);

        if (data?.contract == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { contract, account } = data;

        const decoded = await contract.methods.constant.addressToConfig(
          [account],
        );

        store.update((s) => ({
          ...s,
          triggerBalance: formatUnits(decoded[0], VTHO_DECIMALS),
          reserveBalance: formatUnits(decoded[1], VTHO_DECIMALS),
        }));
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    setConfig: async function (
      triggerBalance: string,
      reserveBalance: string,
    ): Promise<void> {
      try {
        const data = get(store);

        if (data?.connexUtils == null || data?.contract == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, contract } = data;

        const response = await contract.methods.signed.saveConfig(
          [
            parseUnits(triggerBalance, VTHO_DECIMALS),
            parseUnits(reserveBalance, VTHO_DECIMALS),
          ],
          "Save config values into the VeFarm contract.",
        );

        await connexUtils.waitForReceipt(response.txid);
        await this.fetchConfig();
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
    }
  };
}

export const trader = createStore();
