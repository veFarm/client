import { writable, get } from "svelte/store";
import bn from "bignumber.js";
import type { AbiItem } from "@/typings/types";
import type { ConnexUtils, Contract } from "@/blockchain/connex-utils";
import * as traderArtifact from "@/artifacts/Trader.json";
import { getEnvVars } from "@/utils/get-env-vars";
import { formatUnits } from "@/utils/format-units";
import { parseUnits } from "@/utils/parse-units";
import { wallet } from "@/stores/wallet";

type State = {
  connexUtils: ConnexUtils | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  /** Wei. */
  swapTxFee: string | undefined;
  /** Decimals. */
  triggerBalance: string;
  /** Decimals. */
  reserveBalance: string;
  error: string | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  contract: undefined,
  account: undefined,
  swapTxFee: undefined,
  triggerBalance: "0",
  reserveBalance: "0",
  error: undefined,
};

// TODO: move to utils or merge with formatUnits
/**
 * Returns a string representation of value formatted with 18 digits.
 * It does not use scientific notation.
 */
function format(str: string): string {
  return bn(str).div(bn(1e18)).toFixed();
}

const { TRADER_CONTRACT_ADDRESS } = getEnvVars();

/**
 * Keeps track of trader state for the current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update trader store based on wallet store changes.
  wallet.subscribe(async (data) => {
    if (!data.connected) {
      store.set({ ...initialState });
      return;
    }

    // Wallet is connected.
    try {
      const { connexUtils, account, baseGasPrice } = data;

      // Create an instance of the Trader contract.
      const contract = connexUtils.getContract(
        traderArtifact.abi as AbiItem[],
        TRADER_CONTRACT_ADDRESS,
      );

      const decoded = await contract.methods.constant.addressToConfig([
        account,
      ]);

      const clause = contract.methods.clause.swap([
        account,
        "2000", // TODO: is this relevant? Pass oracle/DEX value
      ]);

      // Calculate gas used by the swap function.
      // TODO: this should be a constant.
      const gas = await connexUtils.estimateGas(
        [clause],
        TRADER_CONTRACT_ADDRESS,
      );

      store.set({
        connexUtils,
        contract,
        account,
        swapTxFee: connexUtils.calcTxFee(gas, baseGasPrice, 85),
        triggerBalance: format(decoded[0]),
        reserveBalance: format(decoded[1]),
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

        const decoded = await contract.methods.constant.addressToConfig([
          account,
        ]);

        store.update((s) => ({
          ...s,
          triggerBalance: format(decoded[0]),
          reserveBalance: format(decoded[1]),
        }));
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    setConfig: async function (
      /** Decimals. */
      triggerBalance: string,
      /** Decimals. */
      reserveBalance: string,
    ): Promise<void> {
      try {
        const data = get(store);

        if (data?.connexUtils == null || data?.contract == null) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, contract } = data;

        const response = await contract.methods.signed.saveConfig(
          [parseUnits(triggerBalance), parseUnits(reserveBalance)],
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
    },
  };
}

export const trader = createStore();
