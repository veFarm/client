import { writable, get } from "svelte/store";
import type { Contract } from "@/blockchain/connex-utils";
import type { AbiItem } from "@/typings/types";
import { ConnexUtils } from "@/blockchain/connex-utils";
import * as vthoArtifact from "@/abis/VTHO.json";
import { getEnvVars } from "@/utils/get-env-vars";
import { wallet } from "@/stores/wallet";

type State = {
  connexUtils: ConnexUtils | undefined;
  vtho: Contract | undefined;
  account: Address | undefined;
  allowance: string;
  loading: boolean;
  error: string | undefined;
};

const initialState: State = {
  connexUtils: undefined,
  vtho: undefined,
  account: undefined,
  allowance: "0",
  loading: false,
  error: undefined,
};

const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

/**
 * Keeps track of vtho state for current logged in account.
 */
function createStore() {
  const store = writable<State>({ ...initialState });

  // Update vtho store based on wallet store changes.
  wallet.subscribe(async (data) => {
    // No connex present means wallet is disconnected.
    if (data.connex == null) {
      store.set({ ...initialState });
      return;
    }

    // wallet is connected.
    try {
      const { connex, account } = data;
      const connexUtils = new ConnexUtils(connex);

      const vtho = connexUtils.getContract(
        vthoArtifact.abi as AbiItem[],
        VTHO_CONTRACT_ADDRESS,
      );

      const decoded = await vtho.methods.constant.allowance({
        args: [account, TRADER_CONTRACT_ADDRESS],
      });

      store.set({
        connexUtils,
        vtho,
        account,
        allowance: decoded[0],
        loading: false,
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

        if (data?.vtho == null || data?.account == null) {
          throw new Error("Wallet is not connected.");
        }

        const { vtho, account } = data;

        const decoded = await vtho.methods.constant.allowance({
          args: [account, TRADER_CONTRACT_ADDRESS],
        });

        store.update((s) => ({
          ...s,
          allowance: decoded[0],
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

        if (data?.vtho == null || data?.connexUtils == null) {
          throw new Error("Wallet is not connected.");
        }

        const { vtho, connexUtils } = data;

        const response = await vtho.methods.signed.approve({
          args: [TRADER_CONTRACT_ADDRESS, amount],
          comment,
        });

        await connexUtils.waitForReceipt(response.txid);
        await this.fetchAllowance();

        // store.update((s) => ({
        //   ...s,
        //   allowance: decoded[0],
        // }));
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
