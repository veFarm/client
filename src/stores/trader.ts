import { writable, get } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { chain } from "@/config/index";
import type { AbiItem } from "@/typings/types";
import type { ConnexUtils, Contract } from "@/blockchain/connex-utils";
import * as traderArtifact from "@/artifacts/Trader.json";
import {wallet} from "@/stores/wallet";

type State = {
  connexUtils: ConnexUtils | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  reserveBalance: BigNumber;
  swapConfigSet: boolean;
  error: string | undefined;
};

// TODO
// type State =
// | {
//   connexUtils: ConnexUtils;
//   contract: Contract;
//   account: Address;
//   reserveBalance: BigNumber;
//   swapConfigSet: boolean;
//   error: string | undefined;
// }
// | {
//   connexUtils: undefined;
//   contract: undefined;
//   account: undefined;
//   reserveBalance: undefined;
//   swapConfigSet: boolean;
//   error: string | undefined;
// };

const initialState: State = {
  connexUtils: undefined,
  contract: undefined,
  account: undefined,
  reserveBalance: bn(0),
  swapConfigSet: false,
  error: undefined,
};

/**
 * Fetch reserve balance from the Trader contract for the given account.
 * @param connexUtils Connex utils
 * @return {BigNumber} Reserve balance.
 */
async function fetchReserveBalance(
  contract: Contract,
  account: Address,
): Promise<BigNumber> {
  const decoded = await contract.methods.constant.reserves([account]);
  return bn(decoded[0]);
}

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
      const { connexUtils, account } = data;

      // Create an instance of the Trader contract.
      const contract = connexUtils.getContract(
        traderArtifact.abi as AbiItem[],
        chain.trader,
      );

      const reserveBalance = await fetchReserveBalance(contract, account);

      store.set({
        connexUtils,
        contract,
        account,
        reserveBalance,
        swapConfigSet: reserveBalance.gt(0),
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

        const reserveBalance = await fetchReserveBalance(contract, account);

        store.update((s) => ({
          ...s,
          reserveBalance,
          swapConfigSet: reserveBalance.gt(0),
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

// TODO: get this value fro BE
// const clause = contract.methods.clause.swap([
//   account,
//   0,
//   expandTo18Decimals(150).toFixed(),
//   "2000", // TODO: is this relevant? Pass oracle/DEX value
// ]);

// // Calculate gas used by the swap function.
// // TODO: this should be a constant.
// // TODO: replace this calculation with the actual constant
// // gas amount
// const gas = await connexUtils.estimateGas([clause], chain.trader);

// console.log({ gas, baseGasPrice: formatUnits(baseGasPrice, 2) });
