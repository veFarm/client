/// <reference types="cypress" />

import type { WalletId } from "@/typings/types";

export type CertStatus = "valid" | "invalid";

/**
 * Factory to intercept and mock API calls aimed to the wallet.
 */
export function makeWallet(walletId: WalletId, account: Address) {
  return Object.freeze({
    simulateLoggedOutAccount,
    simulateLoggedInAccount,
    getSync2Iframe,
    spyOnSignTxRequest,
    mockSignTxResponse,
    mockSignCertResponse,
  });

  /**
   * Simulate a logged out account.
   */
  function simulateLoggedOutAccount() {
    cy.clearLocalStorage();
  }

  /**
   * Simulate a logged in account.
   */
  function simulateLoggedInAccount() {
    localStorage.setItem("user", JSON.stringify({ walletId, account }));
  }

  /**
   * Look for the Sync2 Buddy iframe.
   * @return Iframe cypress subject
   */
  function getSync2Iframe(): Cypress.Chainable {
    return cy
      .get("iframe", { timeout: 20_000 })
      .eq(1)
      .its("0.contentDocument.body")
      .then(cy.wrap);
  }

  /**
   * Intercept a sign tx request and add assertions on top of it.
   * @return Spied on request.
   */
  function spyOnSignTxRequest() {
    return cy.intercept("POST", "https://tos.vecha.in/*");
  }

  /**
   * Mock a sign tx request for the given tx id.
   * @param {string} txId Transaction id.
   * @return Mocked request.
   */
  function mockSignTxResponse(txId: string) {
    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: txId,
            signer: account,
          },
        },
      });
    });
  }

  /**
   * Mock a certificate request signature.
   * @param {CertStatus} certStatus. Whether or not the mocked signature should be valid.
   * @return Mocked request.
   */
  function mockSignCertResponse(certStatus: CertStatus) {
    const valid = certStatus === "valid";

    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            annex: {
              domain: "127.0.0.1:5173",
              signer: account,
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
