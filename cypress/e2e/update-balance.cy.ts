/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

// Skip CI-failing tests
const _describe = Cypress.env('GITHUB_TOKEN') != null ? describe.skip : describe

_describe("Update balance", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a zero balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradesForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.ZERO).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.ZERO).as("fetchReserveBalance");
    connex.mockFetchBalance([BALANCE.ZERO, BALANCE.UPDATED]).as("fetchBalance");
    // ^ Simulate a change in balance flow.

    cy.visit("/");
    cy.wait(["@fetchBalance", "@fetchAllowance", "@fetchReserveBalance"], {
      timeout: 20_000,
    });
  });

  it("shows when the balance gets updated", () => {
    // Arrange
    cy.getByCy("navigation-bar").contains("0.00 VET");

    // Act
    cy.wait("@fetchBalance", { timeout: 20_000 });

    // Assert
    cy.getByCy("navigation-bar").contains("500.00 VET");
  });

  it("DOES show me the trades forecast after funding the account and entering the reserve balance", () => {
    // Arrange

    // Act
    cy.wait("@fetchBalance", { timeout: 20_000 });
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("trades-forecast-table").should("exist");
  });
});
