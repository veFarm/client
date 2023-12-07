/// <reference types="cypress" />

import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import { Connex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Update stats", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    api
      .mockGetAccountStats([
        { fixture: "account-stats.json" },
        { fixture: "account-stats-updated.json" },
      ])
      .as("getAccountStats");
    // ^ Simulate a stats update.
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    // Simulate a registered account with a positive balance
    connex
      .mockFetchBalance([BALANCE.POSITIVE, BALANCE.UPDATED])
      .as("fetchBalance");
    // ^ Simulate a balance update.
    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.MAX).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.FIVE).as("fetchReserveBalance");

    cy.visit("/");
    cy.wait([
      "@getAccountStats",
      "@getAccountSwaps",
      "@getTradesForecast",
      "@fetchAllowance",
      "@fetchReserveBalance",
      "@fetchBalance",
    ]);
  });

  it("shows latest stats when balance gets updated", () => {
    // Arrange
    cy.getByCy("stats").should("be.visible");
    cy.getByCy("stats").within(($stats) => {
      cy.wrap($stats).contains("11");
      cy.wrap($stats).contains("14.82");
      cy.wrap($stats).contains("12.26");
    });

    // Act
    cy.wait(["@fetchBalance", "@getAccountStats"], { timeout: 20_000 });

    // Assert
    cy.getByCy("stats").should("be.visible");
    cy.getByCy("stats").within(($stats) => {
      cy.wrap($stats).contains("12");
      cy.wrap($stats).contains("15.82");
      cy.wrap($stats).contains("12.26");
    });
  });
});
