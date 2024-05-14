/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";

const walletId = "sync2";
const account = "0x2057ca7412e6c0828501cb7b335e166f81c58d26" as Address;

const wallet = makeWallet(walletId, account);

describe("Login", () => {
  beforeEach(() => {
    wallet.simulateLoggedOutAccount();
  });

  it("sends a sign cert request after hitting the Sync2 button", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("signCertRequest");
    cy.visit("/");

    // Act
    cy.getByCy("connect-wallet-button-text").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    cy.wait("@signCertRequest").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("cert");
      expect(payload.message.purpose).to.equal("identification");
      expect(payload.message.payload.content).to.equal(
        "Sign a certificate to prove your identity.",
      );
    });
  });

  xit("opens the sync2 buddy when trying to connect with Sync2", () => {
    // Arrange
    cy.visit("/");

    // Act
    cy.getByCy("connect-wallet-button-text").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    wallet.getSync2Iframe().contains("Try out Sync2-lite");
  });

  it("logs me in after signing a VALID certificate", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("signCertRequest");
    wallet.mockSignCertResponse("valid").as("signCertResponse");
    cy.visit("/");

    // Act
    cy.getByCy("connect-wallet-button-text").click();
    cy.getByCy("wallet-provider-button-sync2").click();
    cy.wait(["@signCertRequest", "@signCertResponse"]);

    // Assert
    cy.contains("0x2057…8d26");
    // ^ Indicates that the account has been logged in successfully
  });

  it("errors when I provide an INVALID certificate", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("signCertRequest");
    wallet.mockSignCertResponse("invalid").as("signCertResponse");
    cy.visit("/");

    // Act
    cy.getByCy("connect-wallet-button-text").click();
    cy.getByCy("wallet-provider-button-sync2").click();
    cy.wait(["@signCertRequest", "@signCertResponse"]);

    // Assert
    cy.getByCy("wallet-modal-error").contains("invalid point");
  });
});
