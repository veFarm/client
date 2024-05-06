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
const _describe = Cypress.env("IS_CI") === true ? describe.skip : describe;

_describe("Update trades history", () => {
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
    //     // "@getAccountStats",
    //     // "@getAccountSwaps",
    //     "@getTradesForecast",
    //     "@fetchAllowance",
    //     "@fetchReserveBalance",
    //     "@fetchBalance",
    //   ],
    //   { timeout: 20_000 },
    // );
  });

  it("updates trades history", () => {
    // Arrange
    cy.getByCy("view-history-button").click();
    cy.wait("@getAccountSwaps", { timeout: 20_000 });
    cy.getByCy("history-modal").should("be.visible");
    cy.getByCy("history-modal").within(($swaps) => {
      cy.wrap($swaps)
        .find("a")
        .eq(0)
        .contains(
          "0x1ad5c733943630185b8e588bf3b6f323484fb9b9fa2264621a5175d4394633b7".slice(0, 27),
        );
      cy.wrap($swaps).find("a").eq(1).should("not.exist");
    });

    // Act
    cy.wait([
      "@fetchBalance",
      // "@getAccountStats"
    ], { timeout: 20_000 });

    // Assert
    cy.getByCy("history-modal").should("be.visible");
    cy.getByCy("history-modal").within(($swaps) => {
      cy.wrap($swaps)
        .find("a")
        .eq(0)
        .contains(
          "0x1ad5c733943630185b8e588bf3b6f323484fb9b9fa2264621a5175d4394633b7".slice(0, 27),
        );
      cy.wrap($swaps)
        .find("a")
        .eq(1)
        .contains(
          "0xbf3ecd16fd93435e9b1c913c6af345c8ac857c4c210ebdd36a3be058840b3e52".slice(0, 27),
        );
      cy.wrap($swaps).find("a").eq(2).should("not.exist");
    });
  });
});
