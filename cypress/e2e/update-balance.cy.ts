/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

const _describe = Cypress.env("IS_CI") === true ? describe.skip : describe;

_describe("Update balance", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a zero balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetUserStats({ statusCode: 404 }).as("getUserStats");
    api.mockGetUserSwaps({ statusCode: 404 }).as("getUserSwaps");
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
    cy.getByCy("submit-form-button").contains("INSUFFICIENT BALANCE");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.wait("@fetchBalance", { timeout: 20_000 });

    // Assert
    cy.getByCy("navigation-bar").contains("500.00 VET");
    cy.getByCy("submit-form-button").contains("ENTER RESERVE BALANCE");
    cy.getByCy("submit-form-button").should("be.disabled");
  });

  it("DOES show me the trades forecast after funding the account and entering the reserve balance", () => {
    // Arrange

    // Act
    cy.wait("@fetchBalance", { timeout: 20_000 });
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("trades-forecast-table").should("exist");
    cy.getByCy("submit-form-button").contains("ENABLE AUTOPILOT");
    cy.getByCy("submit-form-button").should("be.enabled");
  });
});
