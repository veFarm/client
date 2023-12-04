/// <reference types="cypress" />

import type { WalletId } from "@/typings/types";

/**
 * Class to intercept and mock API calls aimed to the wallet.
 */
export class Wallet {
  constructor(
    private readonly walletId: WalletId,
    private readonly account: Address,
  ) {}

  signTx() {
    return cy.intercept("POST", "https://tos.vecha.in/*");
  }

  mockUpdateReserveBalanceTxResponse() {
    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b",
            signer: this.account,
          },
        },
      });
    });
  }
}
