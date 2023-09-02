import { writable, get } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { getEnvVars } from "@/config/get-env-vars";
import type { AbiItem } from "@/typings/types";
import type { ConnexUtils, Contract } from "@/blockchain/connex-utils";
import * as traderArtifact from "@/artifacts/Trader.json";
import { wallet } from "@/stores/wallet";
import { formatUnits } from "@/utils/format-units";

type State = {
  connexUtils: ConnexUtils | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  swapTxFee: BigNumber | undefined;
  reserveBalance: BigNumber;
  triggerBalance: BigNumber;
  swapConfigSet: boolean;
  error: string | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  contract: undefined,
  account: undefined,
  swapTxFee: undefined,
  reserveBalance: bn(0),
  triggerBalance: bn(0),
  swapConfigSet: false,
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
      // TODO: replace this calculation with the actual constant
      // gas amount
      const gas = await connexUtils.estimateGas(
        [clause],
        TRADER_CONTRACT_ADDRESS,
      );

      console.log({ gas, baseGasPrice: formatUnits(baseGasPrice, 2) });

      // TODO: swap order at contract level
      const reserveBalance = bn(decoded[1]);
      const triggerBalance = bn(decoded[0]);

      store.set({
        connexUtils,
        contract,
        account,
        swapTxFee: connexUtils.calcTxFee(gas, baseGasPrice, 85),
        reserveBalance,
        triggerBalance,
        swapConfigSet: reserveBalance.gt(0) && triggerBalance.gt(0),
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

        // TODO: swap order at contract level
        const reserveBalance = bn(decoded[1]);
        const triggerBalance = bn(decoded[0]);

        store.update((s) => ({
          ...s,
          reserveBalance,
          triggerBalance,
          swapConfigSet: reserveBalance.gt(0) && triggerBalance.gt(0),
        }));
      } catch (error: unknown) {
        store.update((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Unknown error occurred.",
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

export const trader = createStore();
