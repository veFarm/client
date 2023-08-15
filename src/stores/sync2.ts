import { writable } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
import type { WalletId } from "@/typings/types";
import { ConnexUtils } from "@/blockchain/connex-utils";
import { chain } from "@/config";

function createStore() {
  const { subscribe, set } = writable<
    | {
        connexUtils: ConnexUtils;
        account: Address;
      }
    | undefined
  >();

  return {
    subscribe,
    // walletId === sync2 -> noExtension === true
    // walletId === veworld -> noExtension === false
    connect: async function (
      walletId: WalletId,
      account?: Address,
    ): Promise<Address> {
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

      if (account == null) {
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

        set({
          connexUtils,
          account: cert.signer as Address,
        });

        return cert.signer as Address;
      }

      set({
        connexUtils,
        account,
      });

      return account;
    },
    disconnect: function () {
      set(undefined);
    },
  };
}

export const sync2 = createStore();
