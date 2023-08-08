import { writable } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
import { ConnexUtils } from "@/blockchain/connex-utils";
import { chain } from "@/config";

function createStore() {
  const { subscribe, set } = writable<
    | {
        connex: Connex;
        account: Address;
      }
    | undefined
  >();

  return {
    subscribe,
    // TODO: pass walletName as arg. Where
    // walletName === sync2 -> noExtension === true
    // walletName === veworld -> noExtension === false
    connect: async function (): Promise<void> {
      const connex = new Connex({
        node: chain.rpc[0],
        network: chain.network,
        noExtension: true,
      });

      const connexUtils = new ConnexUtils(connex);

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
        connex,
        account: cert.signer as Address,
      });
    },
    disconnect: function () {
      set(undefined);
    },
    // switchChain: async function (chainId: number): Promise<void> {
    //   if (!injected?.isMetaMask) {
    //     throw new Error("MetaMask is not installed.");
    //   }

    //   await injected.request({
    //     method: "wallet_switchEthereumChain",
    //     params: [{ chainId: `0x${chainId.toString(16)}` }],
    //   });
    // },
  };
}

export const sync2 = createStore();

// if (injected?.isMetaMask) {
//   // Connect account on landing or reload
//   // const accounts = (await window.ethereum.request({
//   //   method: "eth_requestAccounts",
//   // })) as Address[];

//   // if (accounts.length > 0) {
//   //   metamask.connect();
//   // }

//   // Reconnect on accounts or network change
//   injected.on("accountsChanged", metamask.connect);
//   injected.on("chainChanged", metamask.connect);
//   injected.on("disconnect", metamask.disconnect);
// }
