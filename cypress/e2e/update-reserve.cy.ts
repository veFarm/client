/// <reference types="cypress" />

import { chain } from "@/config/index";
import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import {
  Connex,
  FIVE_VTHO,
  TEN_VTHO,
  MAX_VTHO,
  POSITIVE_BALANCE,
} from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const UPDATE_RESERVE_BALANCE_TX_ID =
  "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Update reserve balance", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(MAX_VTHO).as("fetchAllowance");
    connex.mockFetchTraderReserve(FIVE_VTHO).as("fetchReserveBalance");
    connex.mockFetchBalance(POSITIVE_BALANCE).as("fetchBalance");
  });

  it("sends me a sign tx request after submitting the form with a new reserve balance amount", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("updateTxRequest");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("goto-update-reserve-balance-button").click();

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");

    // Assert
    cy.wait("@updateTxRequest").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("tx");
      expect(payload.message[0]).to.deep.equal({
        to: chain.trader.toLowerCase(),
        value: "0",
        data: "0x4b0bbaa40000000000000000000000000000000000000000000000008ac7230489e80000",
      });
      expect(payload.options).to.deep.equal({
        signer: account.toLowerCase(),
        comment:
          "Please approve the following action(s):Save reserve balance into the vearn contract.",
      });
    });
  });

  it("shows me a new success message after the tx has been mined", () => {
    // Arrange
    connex
      .mockFetchTraderReserve([FIVE_VTHO, TEN_VTHO])
      .as("fetchReserveBalance");
    // ^ Replace the existing mock to simulate an update reserve balance flow.
    wallet.spyOnSignTxRequest().as("updateTxRequest");
    wallet
      .mockSignTxResponse(UPDATE_RESERVE_BALANCE_TX_ID)
      .as("updateTxResponse");
    connex
      .mockUpdateReserveBalanceTxReceipt(UPDATE_RESERVE_BALANCE_TX_ID, "mined")
      .as("updateTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("goto-update-reserve-balance-button").click();

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");
    cy.wait(
      [
        "@updateTxRequest",
        "@updateTxResponse",
        "@updateTxReceipt",
        "@fetchAllowance",
        "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );

    // Assert
    cy.getByCy("protocol-is-enabled-message").should("be.visible");
    cy.getByCy("protocol-is-enabled-message").within(() => {
      cy.getByCy("reserve-balance-amount").contains("10 VTHO");
    });
  });

  it("shows me an error message if the tx is reverted", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("updateTxRequest");
    wallet
      .mockSignTxResponse(UPDATE_RESERVE_BALANCE_TX_ID)
      .as("updateTxResponse");
    connex
      .mockUpdateReserveBalanceTxReceipt(
        UPDATE_RESERVE_BALANCE_TX_ID,
        "reverted",
      )
      .as("updateTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("goto-update-reserve-balance-button").click();

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");
    cy.wait(
      [
        "@updateTxRequest",
        "@updateTxResponse",
        "@updateTxReceipt",
        "@fetchAllowance",
        "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );

    // Assert
    cy.getByCy("network-error").contains("The transaction has been reverted.");
  });
});
