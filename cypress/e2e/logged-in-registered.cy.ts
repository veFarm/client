/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

describe("Logged in REGISTERED POSITIVE balance account", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // api
    //   .mockGetAccountStats({ fixture: "account-stats.json" })
    //   .as("getAccountStats");
    api
      .mockGetAccountSwaps({ fixture: "account-swaps.json" })
      .as("getAccountSwaps");
    api
      .mockGetTradesForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    // Simulate a registered account with a positive balance
    connex.mockFetchBalance(BALANCE.POSITIVE).as("fetchBalance");
    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.MAX).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.FIVE).as("fetchReserveBalance");

    cy.visit("/");
    cy.wait([
      // "@getAccountStats",
      // "@getAccountSwaps",
      "@getTradesForecast",
      "@fetchAllowance",
      "@fetchReserveBalance",
    ], {timeout: 20_000});
  });

  it.skip("shows the stats", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("stats").should("be.visible");
    cy.getByCy("stats").within(($stats) => {
      cy.wrap($stats).contains("11");
      cy.wrap($stats).contains("14.82");
      cy.wrap($stats).contains("12.26");
    });
  });

  it.skip("does NOT shows the stats on mobile", () => {
    // Arrange
    cy.viewport("iphone-8");

    // Act

    // Assert
    cy.getByCy("stats").should("not.be.visible");
  });

  it("shows transaction history", () => {
    // Arrange

    // Act
    cy.getByCy("view-history-button").click();
    cy.wait("@getAccountSwaps");

    // Assert
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
  });

  it("shows that the protocol is enabled", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("protocol-is-enabled-message").should("be.visible");
    cy.getByCy("protocol-is-enabled-message").within(($alert) => {
      cy.wrap($alert).contains("5 VTHO");
    });
  });

  it("shows the trades forecast table", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("trades-forecast-table").should("be.visible");
  });

  it("shows the update reserve balance button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("goto-update-reserve-balance-button").should("be.visible");
    cy.getByCy("goto-update-reserve-balance-button").should("be.enabled");
  });

  it("shows the revoke allowance button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("revoke-allowance-button").should("be.visible");
    cy.getByCy("revoke-allowance-button").should("be.enabled");
  });

  it("shows a spinner after the revoke allowance button is clicked", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("revokeTxRequest");

    // Act
    cy.getByCy("revoke-allowance-button").click();

    // Assert
    cy.wait("@revokeTxRequest");
    cy.getByCy("revoke-allowance-button").should("be.disabled");
    cy.getByCy("revoke-allowance-button").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });

  it("shows the update reserve balance form", () => {
    // Arrange

    // Act
    cy.getByCy("goto-update-reserve-balance-button").click();

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  context("update reserve balance form", () => {
    it("shows a cancel button", () => {
      // Arrange
      cy.getByCy("goto-update-reserve-balance-button").click();

      // Act
      cy.getByCy("cancel-reserve-balance-update-button").click();

      // Assert
      cy.getByCy("protocol-is-enabled-message").should("be.visible");
    });

    it("does NOT allow the form to be submitted until a new reserve balance amount is entered", () => {
      // Arrange
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear().type("10");

      // Assert
      cy.getByCy("update-reserve-balance-button").should("be.enabled");
    });

    xit("opens up the wallet after submitting the form", () => {
      // Arrange
      cy.getByCy("goto-update-reserve-balance-button").click();

      // Act
      cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");

      // Assert
      wallet.getSync2Iframe().contains("Try out Sync2-lite");
    });
  });
});
