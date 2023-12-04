/// <reference types="cypress" />

import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import { Connex, MAX_ALLOWANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const FIVE_VTHO =
  "0x0000000000000000000000000000000000000000000000004563918244f40000";
const TEN_VTHO =
  "0x0000000000000000000000000000000000000000000000008ac7230489e80000";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Logged in REGISTERED POSITIVE balance account", () => {
  beforeEach(() => {
    cy.viewport("macbook-15");

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex
      .mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6")
      .as("fetchBalance");
    connex.mockFetchVTHOAllowance(MAX_ALLOWANCE).as("fetchAllowance");
    connex.mockFetchTraderReserve(FIVE_VTHO).as("fetchReserveBalance");

    // Simulate a logged in account.
    localStorage.setItem("user", JSON.stringify({ walletId, account }));

    cy.visit("/");
  });

  it("shows me an error message if the tx is rejected", () => {
    // Arrange
    const UPDATE_RESERVE_BALANCE_TX_ID =
      "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b";
    wallet.spyOnSignTxRequest().as("signTxRequest");
    wallet
      .mockSignTxResponse(UPDATE_RESERVE_BALANCE_TX_ID)
      .as("signTxResponse");
    connex
      .mockUpdateReserveBalanceTxReceipt(UPDATE_RESERVE_BALANCE_TX_ID, true)
      .as("signTxReceipt");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("goto-update-reserve-balance-button").click();
    cy.getByCy("update-reserve-balance-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").clear();
    cy.getByCy("reserve-balance-input").type("10");
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.wait([
      "@signTxRequest",
      "@signTxResponse",
      "@fetchAllowance",
      "@fetchReserveBalance",
    ]);
    cy.getByCy("network-error", { timeout: 20_000 }).contains(
      "The transaction has been reverted.",
    );
  });
});
