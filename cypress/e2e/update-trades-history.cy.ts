/// <reference types="cypress" />

import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import { Connex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Update trades history", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    api
      .mockGetAccountStats({ fixture: "account-stats.json" })
      .as("getAccountStats");
    // ^ Simulate a stats update.
    api
      .mockGetAccountSwaps([
        { fixture: "account-swaps.json" },
        { fixture: "account-swaps-updated.json" },
      ])
      .as("getAccountSwaps");
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

  it("updates trades history", () => {
    // Arrange
    cy.getByCy("trades-history").should("be.visible");
    cy.getByCy("trades-history").within(($swaps) => {
      cy.wrap($swaps)
        .find("a")
        .eq(0)
        .contains(
          "TX: 0x1ad5c733943630185b8e588bf3b6f323484fb9b9fa2264621a5175d4394633b7",
        );
      cy.wrap($swaps).find("a").eq(1).should("not.exist");
    });

    // Act
    cy.wait(["@fetchBalance", "@getAccountStats"], { timeout: 20_000 });

    // Assert
    cy.getByCy("trades-history").should("be.visible");
    cy.getByCy("trades-history").within(($swaps) => {
      cy.wrap($swaps)
        .find("a")
        .eq(0)
        .contains(
          "TX: 0x1ad5c733943630185b8e588bf3b6f323484fb9b9fa2264621a5175d4394633b7",
        );
      cy.wrap($swaps)
        .find("a")
        .eq(1)
        .contains(
          "TX: 0xbf3ecd16fd93435e9b1c913c6af345c8ac857c4c210ebdd36a3be058840b3e52",
        );
      cy.wrap($swaps).find("a").eq(2).should("not.exist");
    });
  });
});
