/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";

const walletId = "sync2";
const account = "0x2057ca7412e6c0828501cb7b335e166f81c58d26";

const wallet = makeWallet(walletId, account);

describe("Logged out account", () => {
  before(() => {});

  beforeEach(() => {
    wallet.simulateLoggedOutAccount();

    cy.visit("/");

    cy.getByCy("reserve-balance-input").as("reserve-balance-input");
    cy.getByCy("connect-wallet-button").as("connect-button");
  });

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  it("does not allow me to enter a reserve balance", () => {
    // Arrange

    // Act

    // Assert
    cy.get("@reserve-balance-input").should("be.visible");
    cy.get("@reserve-balance-input").should("be.disabled");
  });

  it("shows me the connect wallet button as enabled", () => {
    // Arrange

    // Act

    // Assert
    cy.get("@connect-button").should("be.visible");
    cy.get("@connect-button").should("be.enabled");
  });

  it("opens up the connect wallet modal when I click the connect button", () => {
    // Arrange

    // Act
    cy.get("@connect-button").click();

    // Assert
    cy.getByCy("wallet-modal").should("be.visible");
    cy.getByCy("wallet-provider-button-sync2").should("be.visible");
    cy.getByCy("wallet-provider-button-veworld").should("be.visible");
  });

  it("closes the connect wallet modal when I hit the close button", () => {
    // Arrange
    cy.get("@connect-button").click();
    cy.getByCy("wallet-modal").should("be.visible");

    // Act
    cy.getByCy("close-modal-button").click();

    // Assert
    cy.getByCy("wallet-modal").should("not.exist");
  });

  it("closes the connect wallet modal when I click on the backdrop", () => {
    // Arrange
    cy.get("@connect-button").click();
    cy.getByCy("wallet-modal").as("wallet-modal");
    cy.get("@wallet-modal").should("be.visible");

    // Act
    cy.get("@wallet-modal").clickOutside();

    // Assert
    cy.get("@wallet-modal").should("not.exist");
  });

  it("closes the connect wallet modal when I hit ESC", () => {
    // Arrange
    cy.get("@connect-button").click();
    cy.getByCy("wallet-modal").should("be.visible");

    // Act
    cy.get("body").type("{esc}");

    // Assert
    cy.getByCy("wallet-modal").should("not.exist");
  });

  it("shows me an error message when trying to connect with VeWorld but the extension is not detected", () => {
    // Arrange
    global.window.vechain = undefined;

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-veworld").click();

    // Assert
    cy.getByCy("wallet-modal-error")
      .should("be.visible")
      .and("contain", "VeWorld extension not detected.");
  });

  it("shows me a spinner when I click the connect sync2 button", () => {
    // Arrange

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    cy.getByCy("wallet-provider-button-sync2").should("be.disabled");
    cy.getByCy("wallet-provider-button-sync2").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });

  xit("shows me a spinner when I click the connect VeWorld button", () => {
    // Arrange
    window.vechain = {}; // should we stub it?

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-veworld").click();

    // Assert
    cy.getByCy("wallet-provider-button-veworld").should("be.disabled");
    cy.getByCy("wallet-provider-button-veworld").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });
});
