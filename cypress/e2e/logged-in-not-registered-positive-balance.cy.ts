/// <reference types="cypress" />

import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import { Connex, ZERO_ALLOWANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const ZERO_VTHO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Logged in NOT registered POSITIVE balance account", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(ZERO_ALLOWANCE).as("fetchAllowance");
    connex.mockFetchTraderReserve(ZERO_VTHO).as("fetchReserveBalance");
    connex
      .mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6")
      .as("fetchBalance");

    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
  });

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  xit("does NOT show me the stats", () => {
    // TODO
  });

  it("shows me the header with my VET balance and address", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("navigation-bar").contains("5906.63 VET");
    cy.getByCy("open-dropdown-button").contains("0x9702…90e0");
  });

  it("shows me the disconnect wallet button as enabled", () => {
    // Arrange

    // Act
    cy.getByCy("open-dropdown-button").click();

    // Assert
    cy.getByCy("disconnect-wallet-button").should("be.visible");
    cy.getByCy("disconnect-wallet-button").should("be.enabled");
  });

  it("disconnects me when I hit the disconnect wallet button", () => {
    // Arrange

    // Act
    cy.getByCy("open-dropdown-button").click();
    cy.getByCy("disconnect-wallet-button").click();

    // Assert
    cy.getByCy("connect-wallet-button").should("be.visible");
    cy.getByCy("connect-wallet-button").should("be.enabled");
  });

  it("does NOT show me the connect wallet button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("connect-wallet-button").should("not.exist");
  });

  it("shows me 'You don't have any past trades'", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("trades-history-section").contains(
      "You don't have any past trades",
    );
  });

  it("keeps me connected when I refresh the page", () => {
    // Arrange

    // Act
    cy.reload();
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Assert
    cy.getByCy("navigation-bar").contains("5906.63 VET");
    cy.getByCy("open-dropdown-button").contains("0x9702…90e0");
  });

  it("allows me to enter a reserve balance amount", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  it("shows me my VTHO balance inside the reserve balance input field", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("subtext").contains("Balance: 118.42");
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

  it("opens up the wallet after submitting the form", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10");
    cy.getByCy("submit-form-button").click();

    // Assert
    wallet.getSync2Iframe().contains("Try out Sync2-lite");
  });
});
