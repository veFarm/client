import { writable, get } from "svelte/store";
import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import type { WrappedConnex, Contract, AbiItem } from "@vearnfi/wrapped-connex";
import { chain } from "@/config/index";
import * as traderArtifact from "@/artifacts/Trader.json";
import { wallet } from "@/stores/wallet";

type State = {
  wConnex: WrappedConnex | undefined;
  contract: Contract | undefined;
  account: Address | undefined;
  reserveBalance: BigNumber;
  swapConfigSet: boolean;
  error: string | undefined;
};

// TODO
// type State =
// | {
//   wConnex: WrappedConnex;
//   contract: Contract;
//   account: Address;
//   reserveBalance: BigNumber;
//   swapConfigSet: boolean;
//   error: string | undefined;
// }
// | {
//   wConnex: undefined;
//   contract: undefined;
//   account: undefined;
//   reserveBalance: undefined;
//   swapConfigSet: boolean;
//   error: string | undefined;
// };

const initialState: State = {
  wConnex: undefined,
  contract: undefined,
  account: undefined,
  reserveBalance: bn(0),
  swapConfigSet: false,
  error: undefined,
};

/**
 * Fetch reserve balance from the Trader contract for the given account.
 * @param {Contract} contract Target contract.
 * @param {Address} account Target account.
 * @return {BigNumber} Reserve balance.
 */
async function fetchReserveBalance(
  contract: Contract,
  account: Address,
): Promise<BigNumber> {
  const decoded = await contract.methods.constant.reserves(account);
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
      const { wConnex, account } = data;

      // Create an instance of the Trader contract.
      const contract = wConnex.getContract(
        traderArtifact.abi as AbiItem[],
        chain.trader,
      );

      const reserveBalance = await fetchReserveBalance(contract, account);

      store.set({
        wConnex,
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
// const gas = await wConnex.estimateGas([clause], chain.trader);

// console.log({ gas, baseGasPrice: formatUnits(baseGasPrice, 2) });
