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

const ZERO_VTHO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const FIVE_VTHO =
  "0x0000000000000000000000000000000000000000000000004563918244f40000";
const REGISTER_TX_ID =
  "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Register", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(ZERO_ALLOWANCE).as("fetchAllowance");
    connex.mockFetchTraderReserve(ZERO_VTHO).as("fetchReserveBalance");
    connex
      .mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6")
      .as("fetchBalance");
  });

  it("sends a sign tx request after submitting the form", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("registerTxRequest");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("reserve-balance-input").clear().type("5").type("{enter}");

    // Assert
    cy.wait("@registerTxRequest").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("tx");
      expect(payload.message[0]).to.deep.equal({
        to: chain.trader.toLowerCase(),
        value: "0",
        data: "0x4b0bbaa40000000000000000000000000000000000000000000000004563918244f40000",
      });
      expect(payload.message[1]).to.deep.equal({
        to: chain.vtho.toLowerCase(),
        value: "0",
        data: "0x095ea7b30000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa305ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      });
      expect(payload.options).to.deep.equal({
        signer: account.toLowerCase(),
        comment:
          "Please approve the following action(s):Allow the VeFarm contract to spend your VTHO in exchange for VET. Save reserve balance into the VeFarm contract.",
      });
    });
  });

  it("shows me a success message after the tx has been mined", () => {
    // Arrange
    connex
      .mockFetchVTHOAllowance([ZERO_ALLOWANCE, MAX_ALLOWANCE])
      .as("fetchAllowance");
    connex
      .mockFetchTraderReserve([ZERO_VTHO, FIVE_VTHO])
      .as("fetchReserveBalance");
    // ^ Replace the existing mocks to simulate a registration flow.
    wallet.spyOnSignTxRequest().as("registerTxRequest");
    wallet.mockSignTxResponse(REGISTER_TX_ID).as("registerTxResponse");
    connex
      .mockRegisterTxReceipt(REGISTER_TX_ID, "mined")
      .as("registerTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("reserve-balance-input").clear().type("5").type("{enter}");
    cy.wait(
      [
        "@registerTxRequest",
        "@registerTxResponse",
        "@registerTxReceipt",
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

  it("shows and error message if the tx is rejected", () => {
    wallet.spyOnSignTxRequest().as("registerTxRequest");
    wallet.mockSignTxResponse(REGISTER_TX_ID).as("registerTxResponse");
    connex
      .mockRegisterTxReceipt(REGISTER_TX_ID, "reverted")
      .as("registerTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("reserve-balance-input").clear().type("5").type("{enter}");

    // Assert
    cy.wait(
      [
        "@registerTxRequest",
        "@registerTxResponse",
        "@registerTxReceipt",
        "@fetchAllowance",
        "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );
    cy.getByCy("network-error").contains("The transaction has been reverted.");
  });
});
