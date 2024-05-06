/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x2057ca7412e6c0828501cb7b335e166f81c58d26";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

// Skip CI-failing tests
const _describe = Cypress.env("IS_CI") === true ? describe.skip : describe;

_describe("Login and update balance", () => {
  beforeEach(() => {
    // Simulate a logged out NOT registered account holding a zero balance.
    wallet.simulateLoggedOutAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradesForecast([{}, { fixture: "trades-forecast.json" }])
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.ZERO).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.ZERO).as("fetchReserveBalance");
    connex.mockFetchBalance([BALANCE.ZERO, BALANCE.UPDATED]).as("fetchBalance");
    // ^ Simulate a change in balance flow.
  });

  it("DOES show me the trades forecast after funding the account and entering the reserve balance", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("signCertRequest");
    wallet.mockDeclineSignCertResponse().as("signCertResponse");
    cy.visit("/");
    cy.getByCy("connect-wallet-button-text").click();
    cy.getByCy("wallet-provider-button-sync2").click();
    cy.wait(["@signCertRequest", "@signCertResponse"]);

    // Act
    wallet.mockSignCertResponse("valid").as("signCertResponse");
    cy.getByCy("wallet-provider-button-sync2").click();
    cy.wait(["@signCertRequest", "@signCertResponse", "@fetchBalance"], {
      timeout: 20_000,
    });
    cy.wait("@fetchBalance", { timeout: 20_000 }); // wait for balance to update
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("trades-forecast-table").should("exist");
  });
});
