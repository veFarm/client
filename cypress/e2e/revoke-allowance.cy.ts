/// <reference types="cypress" />

import { chain } from "@/config/index";
import { Wallet } from "cypress/support/mocks/wallet";
import { API } from "cypress/support/mocks/api";
import {
  Connex,
  ZERO_ALLOWANCE,
  MAX_ALLOWANCE,
} from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const FIVE_VTHO =
  "0x0000000000000000000000000000000000000000000000004563918244f40000";
const REVOKE_ALLOWANCE_TX_ID =
  "0xce47958b8c14484f5a39f361d02f244396f15dab0c73d49fc0a0bbaeceff3d98";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Revoke allowance", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(MAX_ALLOWANCE).as("fetchAllowance");
    connex.mockFetchTraderReserve(FIVE_VTHO).as("fetchReserveBalance");
    connex
      .mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6")
      .as("fetchBalance");
  });

  it("sends me a sign tx request after clicking the revoke allowance button", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("revokeTxRequest");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("revoke-allowance-button").click();

    // Assert
    cy.wait("@revokeTxRequest").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("tx");
      expect(payload.message[0]).to.deep.equal({
        to: chain.vtho.toLowerCase(),
        value: "0",
        data: "0x095ea7b30000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa3050000000000000000000000000000000000000000000000000000000000000000",
      });
      expect(payload.options).to.deep.equal({
        comment:
          "The vEarn contract will no longer be able to spend your VTHO in exchange for VET.",
      });
    });
  });

  it("shows me the initial screen after revoking allowance", () => {
    // Arrange
    connex
      .mockFetchVTHOAllowance([MAX_ALLOWANCE, ZERO_ALLOWANCE])
      .as("fetchAllowance");
    // ^ Replace the existing mock to simulate a revoke allowance flow.
    wallet.spyOnSignTxRequest().as("revokeTxRequest");
    wallet.mockSignTxResponse(REVOKE_ALLOWANCE_TX_ID).as("revokeTxResponse");
    connex
      .mockRevokeAllowanceTxReceipt(REVOKE_ALLOWANCE_TX_ID, "mined")
      .as("revokeTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("revoke-allowance-button").click();
    cy.wait(
      [
        "@revokeTxRequest",
        "@revokeTxResponse",
        "@revokeTxReceipt",
        "@fetchAllowance",
      ],
      {
        timeout: 20_000,
      },
    );

    // Assert
    cy.getByCy("submit-form-button").should("be.visible");
  });

  it("shows me an error message if the tx is reverted", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("revokeTxRequest");
    wallet.mockSignTxResponse(REVOKE_ALLOWANCE_TX_ID).as("revokeTxResponse");
    connex
      .mockRevokeAllowanceTxReceipt(REVOKE_ALLOWANCE_TX_ID, "reverted")
      .as("revokeTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("revoke-allowance-button").click();
    cy.wait(
      [
        "@revokeTxRequest",
        "@revokeTxResponse",
        "@revokeTxReceipt",
        "@fetchAllowance",
      ],
      {
        timeout: 20_000,
      },
    );

    // Assert
    cy.getByCy("error-message").contains("The transaction has been reverted.");
  });
});
