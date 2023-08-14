import { writable } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
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
    // TODO: pass walletName as arg. Where
    // walletName === sync2 -> noExtension === true
    // walletName === veworld -> noExtension === false
    connect: async function (account?: Address): Promise<Address> {
      const connex = new Connex({
        node: chain.rpc[0],
        network: chain.network,
        noExtension: true,
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
