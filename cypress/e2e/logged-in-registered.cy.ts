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
const TEN_VTHO =
  "0x0000000000000000000000000000000000000000000000008ac7230489e80000";

const api = new API(account);
const connex = new Connex(account);
const wallet = new Wallet(walletId, account);

describe("Logged in REGISTERED POSITIVE balance account", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradeForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    // Simulate a registered account with a positive balance
    connex
      .mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6")
      .as("fetchBalance");
    connex.mockFetchVTHOAllowance(MAX_ALLOWANCE).as("fetchAllowance");
    connex.mockFetchTraderReserve(FIVE_VTHO).as("fetchReserveBalance");

    cy.visit("/");
  });

  it("shows me a success message", () => {
    // Arrange
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act

    // Assert
    cy.getByCy("protocol-is-enabled-message").should("be.visible");
    cy.getByCy("protocol-is-enabled-message").within(() => {
      cy.getByCy("reserve-balance-amount").contains("5 VTHO");
    });
  });

  it("shows me the trades forecast", () => {
    // Arrange
    cy.wait(["@getTradesForecast", "@fetchAllowance", "@fetchReserveBalance"]);

    // Act

    // Assert
    cy.getByCy("trades-forecast-table").should("be.visible");
  });

  it("shows me the update reserve balance button", () => {
    // Arrange
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act

    // Assert
    cy.getByCy("goto-update-reserve-balance-button").should("be.visible");
    cy.getByCy("goto-update-reserve-balance-button").should("be.enabled");
  });

  it("shows me the revoke allowance button", () => {
    // Arrange
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act

    // Assert
    cy.getByCy("revoke-allowance-button").should("be.visible");
    cy.getByCy("revoke-allowance-button").should("be.enabled");
  });

  // it("sends me a sign tx request after I click the revoke allowance button", () => {
  //   // Arrange
  //   wallet.spyOnSignTxRequest().as("signTxRequest");
  //   cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

  //   // Act
  //   cy.getByCy("revoke-allowance-button").click();

  //   // Assert
  //   cy.wait("@signTxRequest").then((interception) => {
  //     const { type, payload } = interception.request.body;

  //     expect(type).to.eq("tx");
  //     expect(payload.message[0]).to.deep.equal({
  //       to: chain.vtho.toLowerCase(),
  //       value: "0",
  //       data: "0x095ea7b30000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa3050000000000000000000000000000000000000000000000000000000000000000",
  //     });
  //     expect(payload.options).to.deep.equal({
  //       comment:
  //         "The VeFarm contract will no longer be able to spend your VTHO in exchange for VET.",
  //     });
  //   });
  // });

  it("shows me a spinner after I click the revoke allowance button", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("signTxRequest");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("revoke-allowance-button").should("be.enabled");

    // Act
    cy.getByCy("revoke-allowance-button").click();

    // Assert
    cy.wait("@signTxRequest");
    cy.getByCy("revoke-allowance-button").should("be.disabled");
    cy.getByCy("revoke-allowance-button").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });

  it("shows me the update reserve balance form after hitting the update reserve balance button", () => {
    // Arrange
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("goto-update-reserve-balance-button").click();

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  context("update reserve balance form", () => {
    it("shows me a cancel button that takes me to the back to success massage screen", () => {
      // Arrange
      cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();

      // Act
      cy.getByCy("cancel-reserve-balance-update-button").click();

      // Assert
      cy.getByCy("protocol-is-enabled-message").should("be.visible");
    });

    it("does NOT allow me to submit the form until I enter a new reserve balance amount", () => {
      // Arrange
      cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear().type("10");

      // Assert
      cy.getByCy("update-reserve-balance-button").should("be.enabled");
    });

    it("opens up the wallet after submitting the form", () => {
      // Arrange
      cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();

      // Act
      cy.getByCy("reserve-balance-input").clear().type("10").type("{enter}");

      // Assert
      wallet.getSync2Iframe().contains("Try out Sync2-lite");
    });
  });
});
