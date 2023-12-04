/// <reference types="cypress" />

import { chain } from "@/config/index";
import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import {
  Connex,
  ZERO_ALLOWANCE,
  MAX_ALLOWANCE,
} from "cypress/support/mocks/connex";
import { getSync2Iframe } from "cypress/support/utils";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const FIVE_VTHO =
  "0x0000000000000000000000000000000000000000000000004563918244f40000";
const TEN_VTHO =
  "0x0000000000000000000000000000000000000000000000008ac7230489e80000";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Update reserve balance accepted", () => {
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
    connex
      .mockFetchTraderReserve([FIVE_VTHO, TEN_VTHO])
      .as("fetchReserveBalance");

    // Simulate a logged in account.
    localStorage.setItem("user", JSON.stringify({ walletId, account }));

    cy.visit("/");
  });

  it("shows me a new success message after the tx has been mined", () => {
    // Arrange
    wallet.signTx().as("signTxRequest");
    wallet.mockUpdateReserveBalanceTxResponse().as("signTxResponse");
    connex.mockUpdateReserveBalanceTxReceipt().as("signTxReceipt");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("goto-update-reserve-balance-button").click();
    cy.getByCy("update-reserve-balance-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");

    // Assert
    cy.wait([
      "@signTxRequest",
      "@signTxResponse",
      "@fetchAllowance",
      "@fetchReserveBalance",
    ]);
    cy.getByCy("protocol-is-enabled-message", { timeout: 20_000 }).should(
      "be.visible",
    );
    cy.getByCy("protocol-is-enabled-message").within(() => {
      cy.getByCy("reserve-balance-amount").contains("10 VTHO");
    });
  });
});
