/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

describe("Update transaction history", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    api.mockGetUserStats({ fixture: "user-stats.json" }).as("getUserStats");
    // ^ Simulate a stats update.
    api
      .mockGetUserSwaps([
        { fixture: "user-swaps.json" },
        { fixture: "user-swaps-updated.json" },
      ])
      .as("getUserSwaps");
    api
      .mockGetTradesForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    // Simulate a registered account with a positive balance
    connex
      .mockFetchBalance([BALANCE.POSITIVE, BALANCE.UPDATED])
      .as("fetchBalance");
    // ^ Simulate a balance update.
    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.MAX).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.FIVE).as("fetchReserveBalance");

    cy.visit("/");
    // cy.wait(
    //   [
    //     // "@getUserStats",
    //     // "@getUserSwaps",
    //     "@getTradesForecast",
    //     "@fetchAllowance",
    //     "@fetchReserveBalance",
    //     "@fetchBalance",
    //   ],
    //   { timeout: 20_000 },
    // );
  });

  it("updates transaction history", () => {
    // Arrange
    cy.wait("@getUserSwaps", { timeout: 20_000 });
    cy.getByCy("transaction-history").should("be.visible");
    cy.getByCy("transaction-history").within(($swaps) => {
      cy.wrap($swaps).find("a").eq(0).contains("0x1ad5");
      // cy.wrap($swaps).find("a").eq(1).should("not.exist");
    });

    // Act
    cy.wait(["@fetchBalance", "@getUserSwaps"], { timeout: 20_000 });

    // Assert
    cy.getByCy("transaction-history").should("be.visible");
    cy.getByCy("transaction-history").within(($swaps) => {
      cy.wrap($swaps).find("a").eq(0).contains("0x1ad5");
      cy.wrap($swaps).find("a").eq(1, { timeout: 10_000 }).contains("0xbf3e");
      // cy.wrap($swaps).find("a").eq(2).should("not.exist");
    });
  });
});
