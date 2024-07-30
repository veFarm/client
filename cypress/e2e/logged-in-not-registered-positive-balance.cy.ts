/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

describe("Logged in NOT registered POSITIVE balance account", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetUserStats({ statusCode: 404 }).as("getUserStats");
    api.mockGetUserSwaps({ statusCode: 404 }).as("getUserSwaps");
    api
      .mockGetTradesForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.ZERO).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.ZERO).as("fetchReserveBalance");
    connex.mockFetchBalance(BALANCE.POSITIVE).as("fetchBalance");

    cy.visit("/");
    cy.wait(["@fetchBalance", "@fetchAllowance", "@fetchReserveBalance"], {
      timeout: 20_000,
    });
  });

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  it.skip("does NOT show me the stats", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("stats").should("not.exist");
  });

  it("shows me the header with my VET balance and address", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("navigation-bar").contains("5906.63 VET");
    cy.getByCy("navigation-bar").contains("0x9702…90e0");
  });

  it("shows me the disconnect wallet button as enabled", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("disconnect-wallet-button").should("be.visible");
    cy.getByCy("disconnect-wallet-button").should("be.enabled");
  });

  it("disconnects me when I hit the disconnect wallet button", () => {
    // Arrange

    // Act
    cy.getByCy("disconnect-wallet-button").click();

    // Assert
    cy.getByCy("connect-wallet-button-text").should("be.visible");
    cy.getByCy("connect-wallet-button-text").should("be.enabled");
  });

  it("does NOT show me the connect wallet button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("connect-wallet-button-text").should("not.exist");
  });

  it("shows me the transaction history section", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("transaction-history").should("be.visible");
  });

  it("shows me 'empty transaction history' message", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("transaction-history").contains("Nothing here yet!");
  });

  it("keeps me connected when I refresh the page", () => {
    // Arrange

    // Act
    cy.reload();
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Assert
    cy.getByCy("navigation-bar").contains("5906.63 VET");
    cy.getByCy("navigation-bar").contains("0x9702…90e0");
  });

  it("allows me to enter a reserve balance amount", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  it("shows me my VTHO balance on top of the reserve balance input field", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("balance").contains("118.42 VTHO");
  });

  it("shows me an alert message asking me to enter a reserve balance amount", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("protocol-enter-reserve-balance-message").should("be.visible");
  });

  it("does NOT allow me to submit the form if I enter 0 as the reserve balance amount", () => {
    // Arrange
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").clear().type("0");

    // Assert
    cy.getByCy("submit-form-button").should("be.disabled");
  });

  it("does NOT allow me to submit the form until I enter a positive reserve balance amount", () => {
    // Arrange
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("submit-form-button").should("be.enabled");
  });

  it("does NOT show me a 'lack of funds' alert and a link to the faucet", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("lack-of-funds-alert").should("not.exist");
    cy.getByCy("faucet-link").should("not.exist");
  });

  it("shows me the trades forecast after entering the reserve balance", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("trades-forecast-table").should("be.visible");
  });

  it("shows me an alert message to prompt me to enable the protocol after I enter a reserve balance", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("protocol-enable-autopilot-message").should("be.visible");
  });

  it("disables the submit button and shows a spinner after submitting the form", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");

    // Assert
    cy.getByCy("submit-form-button").should("be.disabled");
    cy.getByCy("submit-form-button").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });

  xit("opens up the wallet after submitting the form", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10");
    cy.getByCy("submit-form-button").click();

    // Assert
    wallet.getSync2Iframe().contains("Try out Sync2-lite");
  });
});
