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

  /**
   * Look for the Sync2 Buddy iframe.
   * @return Iframe cypress subject
   */
  getSync2Iframe(): Cypress.Chainable {
    return cy
      .get("iframe", { timeout: 10_000 })
      .eq(1)
      .its("0.contentDocument.body")
      .then(cy.wrap);
  }

  /**
   * Intercept a sign tx request and add assertions on top of it.
   * @return Spied on request.
   */
  spyOnSignTxRequest() {
    return cy.intercept("POST", "https://tos.vecha.in/*");
  }

  /**
   * Mock a sign tx request for the given tx id.
   * @param {string} txId Transaction id.
   * @return Mocked request.
   */
  mockSignTxResponse(txId: string) {
    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: txId,
            signer: this.account,
          },
        },
      });
    });
  }

  /**
   * Mock a certificate request signature.
   * @param {boolean} valid. Whether or not the mocked signature should be valid.
   * It defaults to `true`.
   * @return Mocked request.
   */
  mockSignCertResponse(valid = true) {
    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            annex: {
              domain: "127.0.0.1:5173",
              signer: this.account,
              timestamp: 1701217618,
            },
            signature: valid
              ? "0x353d78959165e3fe35b97bcd738d116f5567fab6e4d1c339a02f9aa48a27379b3785356e34886ec9596a53d840e848d4e6caa255d05e84544b777ab501a0a20f01"
              : "0x053d78959165e3fe35b97bcd738d116f5567fab6e4d1c339a02f9aa48a27379b3785356e34886ec9596a53d840e848d4e6caa255d05e84544b777ab501a0a20f01",
            // ^ We alter the first character in the signature to make an invalid.
          },
        },
      });
    });
  }
}
