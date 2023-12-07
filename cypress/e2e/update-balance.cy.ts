/// <reference types="cypress" />

import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import { Connex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

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

    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.ZERO).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.ZERO).as("fetchReserveBalance");
    connex
      .mockFetchBalance([BALANCE.POSITIVE, BALANCE.UPDATED])
      .as("fetchBalance");
    // ^ Simulate a change in balance flow.

    cy.visit("/");
    cy.wait(["@fetchBalance", "@fetchAllowance", "@fetchReserveBalance"]);
  });

  it("shows me when the balance get updated", () => {
    // Arrange
    cy.getByCy("navigation-bar").contains("5906.63 VET");

    // Act
    cy.wait("@fetchBalance", { timeout: 20_000 });

    // Assert
    cy.getByCy("navigation-bar").contains("500.00 VET");
  });
});
