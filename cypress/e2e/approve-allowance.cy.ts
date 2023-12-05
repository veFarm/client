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
const APPROVE_TX_ID =
  "0x60de9334fe2f261861c1bb11a2d44e86437d23040755cc7b8e976f24e5c8cc54";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Approve allowance", () => {
  beforeEach(() => {
    // Simulate a logged in partially(*) registered account holding a positive balance.
    // (*) The account was registered and then revoked allowance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(ZERO_ALLOWANCE).as("fetchAllowance");
    connex.mockFetchTraderReserve(FIVE_VTHO).as("fetchReserveBalance");
    connex
      .mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6")
      .as("fetchBalance");
  });

  it("sends a sign tx request after submitting the form", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("approveTxRequest");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("submit-form-button").click();

    // Assert
    cy.wait("@approveTxRequest").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("tx");
      expect(payload.message[0]).to.deep.equal({
        to: chain.vtho.toLowerCase(),
        value: "0",
        data: "0x095ea7b30000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa305ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      });
      expect(payload.options).to.deep.equal({
        signer: account.toLowerCase(),
        comment:
          "Please approve the following action(s):Allow the vEarn contract to spend your VTHO in exchange for VET.",
      });
    });
  });

  it("shows a success message after the tx is mined", () => {
    // Arrange
    connex
      .mockFetchVTHOAllowance([ZERO_ALLOWANCE, MAX_ALLOWANCE])
      .as("fetchAllowance");
    // ^ Replace the existing mock to simulate an approve allowance flow.
    wallet.spyOnSignTxRequest().as("approveTxRequest");
    wallet.mockSignTxResponse(APPROVE_TX_ID).as("approveTxResponse");
    connex
      .mockApproveAllowanceTxReceipt(APPROVE_TX_ID, "mined")
      .as("approveTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("submit-form-button").click();
    cy.wait(
      [
        "@approveTxRequest",
        "@approveTxResponse",
        "@approveTxReceipt",
        "@fetchAllowance",
        "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );

    // Assert
    cy.getByCy("protocol-is-enabled-message").should("be.visible");
    cy.getByCy("protocol-is-enabled-message").within(() => {
      cy.getByCy("reserve-balance-amount").contains("5 VTHO");
    });
  });

  it("shows an error message if the tx is rejected", () => {
    wallet.spyOnSignTxRequest().as("approveTxRequest");
    wallet.mockSignTxResponse(APPROVE_TX_ID).as("approveTxResponse");
    connex
      .mockApproveAllowanceTxReceipt(APPROVE_TX_ID, "reverted")
      .as("approveTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("submit-form-button").click();
    cy.wait(
      [
        "@approveTxRequest",
        "@approveTxResponse",
        "@approveTxReceipt",
        "@fetchAllowance",
        "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );

    // Assert
    cy.getByCy("network-error").contains("The transaction has been reverted.");
  });
});
