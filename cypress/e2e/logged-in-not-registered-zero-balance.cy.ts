/// <reference types="cypress" />

import { chain } from "@/config/index";
import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x2057ca7412e6c0828501cb7b335e166f81c58d26";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

describe("Logged in NOT registered ZERO balance account", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetAccountStats({ statusCode: 404 }).as("getAccountStats");
    api.mockGetAccountSwaps({ statusCode: 404 }).as("getAccountSwaps");
    api
      .mockGetTradesForecast({
        statusCode: 200,
        body: { txFee: "2688830000000000000", solutions: [] },
      })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.ZERO).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.ZERO).as("fetchReserveBalance");
    connex.mockFetchBalance(BALANCE.ZERO).as("fetchBalance");

    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"], { timeout: 20_000 });
  });

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  it.skip("does NOT show me the stats", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("stats").should("not.exist");
  });

  it("shows me the header with my VET balance and address", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("navigation-bar").contains("0.00 VET");
    cy.getByCy("navigation-bar").contains("0x2057…8d26");
  });

  it("shows me the disconnect wallet button as enabled", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("disconnect-wallet-button").should("be.visible");
    cy.getByCy("disconnect-wallet-button").should("be.enabled");
  });

  it("disconnects me when I hit the disconnect wallet button", () => {
    // Arrange

    // Act
    cy.getByCy("disconnect-wallet-button").click();

    // Assert
    cy.getByCy("connect-wallet-button-text").should("be.visible");
    cy.getByCy("connect-wallet-button-text").should("be.enabled");
  });

  it("does NOT show me the connect wallet button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("connect-wallet-button-text").should("not.exist");
  });

  it("keeps me connected when I refresh the page", () => {
    // Arrange

    // Act
    cy.reload();
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Assert
    cy.getByCy("navigation-bar").contains("0.00 VET");
    cy.getByCy("navigation-bar").contains("0x2057…8d26");
  });

  it("allows me to enter a reserve balance amount", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  it("shows me the trades forecast", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("trades-forecast-table").should("exist");
  });

  it("shows me my VTHO balance on top of the reserve balance input field", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("balance").contains("0.00 VTHO");
  });

  it("does NOT allow me to submit the form if I enter 0 as the reserve balance amount", () => {
    // Arrange
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").clear().type("0");

    // Assert
    cy.getByCy("submit-form-button").should("be.disabled");
  });

  it("does NOT allow me to submit the form until I enter a positive reserve balance amount", () => {
    // Arrange
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").clear().type("10");

    // Assert
    cy.getByCy("submit-form-button").should("be.enabled");
  });

  it("shows me a 'INSUFFICIENT BALANCE' button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").contains("INSUFFICIENT BALANCE");
  });

  it("shows me 'no trades history' message", () => {
    // Arrange

    // Act
    cy.getByCy("view-history-button").click();

    // Assert
    cy.getByCy("history-modal").contains("Nothing here yet!");
  });

  it.skip("shows me a 'lack of funds' alert and a link to the faucet", () => {
    // Arrange

    // Act
    cy.getByCy("faucet-link").click();

    // Assert
    cy.get("@open")
      .should("have.been.calledOnce")
      .its("firstCall.args.0")
      .should("deep.equal", {
        target: "_blank",
        url: chain.faucets[0],
      });
  });
});
