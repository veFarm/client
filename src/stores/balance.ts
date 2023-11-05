import { writable, get } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
import type BigNumber from "bignumber.js";
import { chain } from "@/config";
import type { WalletId, Balance } from "@/typings/types";
import type { ConnexUtils } from "@/blockchain/connex-utils";
import { wallet } from "@/stores/wallet";

type State =
 | {
   connexUtils: ConnexUtils,
  account: Address,
  current: Balance,
  previous: Balance | undefined,
  }
  | {
    connexUtils: undefined,
    account: undefined,
    current: undefined,
    previous: undefined,
  } ;

const initialState: State = {
  connexUtils: undefined,
  account: undefined,
  current: undefined,
  previous: undefined,
}

function createStore() {
  const store = writable<State>({ ...initialState});

  // Update balance store based on wallet store changes.
  wallet.subscribe(async (data) => {
    if (!data.connected) {
      store.set({...initialState});
      return;
    }

    // Wallet is connected.
    try {
      const { connexUtils, account } = data;

      const balance = await connexUtils.fetchBalance(account)

      store.set({
        connexUtils,
        account,
        current: balance,
        previous: get(store).current,
      });
    } catch (error: unknown) {
      console.error(error)
      // store.update((s) => ({
      //   ...s,
      //   error:
      //     error instanceof Error ? error.message : "Unknown error occurred.",
      // }));
    }
  });

  return {
    subscribe: store.subscribe,
    fetchBalance: async function() {
      try {
        const data = get(store)

        // console.log(data?.connexUtils == null)
        // console.log(data?.account == null)
        // console.log(data?.current == null)

        if (data?.connexUtils == null || data?.account == null ) {
          throw new Error("Wallet is not connected.")
        }

      const { connexUtils, account  } = data;

      const balance = await connexUtils.fetchBalance(account)

      // console.log("balance.VTHO", balance.vtho.toFixed())
      // console.log("current.VTHO", current.vtho.toFixed())
      // console.log("VET", balance.vet.eq(current.vet))
      // console.log("VTHO", balance.vtho.eq(current.vtho))

      // // Update only if balance has changed.
      // if (!balance.vet.eq(current.vet) || !balance.vtho.eq(current.vtho)) {
        // console.log("SET")
      store.set({
        ...data,
        account,
        current: balance,
      });
      // }
      } catch (error) {
      console.error(error)
      }

    }
  };
}

export const balance = createStore();
