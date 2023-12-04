/// <reference types="cypress" />

import { chain } from "@/config/index";
import { API } from "../support/mocks/api"
import { Connex, ZERO_ALLOWANCE, MAX_ALLOWANCE } from "../support/mocks/connex"
import { getSync2Iframe } from "../support/utils";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const FIVE_VTHO = "0x0000000000000000000000000000000000000000000000004563918244f40000"
const TEN_VTHO = "0x0000000000000000000000000000000000000000000000008ac7230489e80000"

const api = new API(account)
const connex = new Connex(account)

describe("Logged in REGISTERED POSITIVE balance account", () => {
  beforeEach(() => {
    cy.viewport("macbook-15");

    // TODO: stats should be visible
    api.mockGetAccountStats({statusCode: 404}).as("getAccountStats")
    api.mockGetAccountSwaps({statusCode: 404}).as("getAccountSwaps")
    api.mockGetTradeForecast({fixture: "trades-forecast.json"}).as("getTradesForecast")

    connex.mockFetchBalance("0x140330221654a06b3e9", "0x66b7d9428d2c776f6").as("fetchBalance")
    connex.mockFetchVTHOAllowance(MAX_ALLOWANCE).as("fetchAllowance")
    connex.mockFetchTraderReserve([FIVE_VTHO, TEN_VTHO]).as("fetchReserveBalance")

    // Simulate a logged in account.
    localStorage.setItem("user", JSON.stringify({ walletId, account }));

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

  it("sends me a sign tx request after I click the revoke allowance button", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("revoke-allowance-button").click();

    // Assert
    cy.wait("@signTxReq").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("tx");
      expect(payload.message[0]).to.deep.equal({
        to: chain.vtho.toLowerCase(),
        value: "0",
        data: "0x095ea7b30000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa3050000000000000000000000000000000000000000000000000000000000000000",
      });
      expect(payload.options).to.deep.equal({
        comment:
          "The VeFarm contract will no longer be able to spend your VTHO in exchange for VET.",
      });
    });
  });

  it("shows me a spinner after I click the revoke allowance button", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
    cy.getByCy("revoke-allowance-button").should("be.enabled");

    // Act
    cy.getByCy("revoke-allowance-button").click();

    // Assert
    cy.wait("@signTxReq");
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
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");

      // Assert
      cy.getByCy("update-reserve-balance-button").should("be.enabled");
    });

    it("sends me a sign tx request after submitting the form with the new reserve balance amount", () => {
      // Arrange
      cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      cy.wait("@signTxReq").then((interception) => {
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
            "Please approve the following action(s):Save reserve balance into the VeFarm contract.",
        });
      });
    });

    it("opens up the wallet after submitting the form", () => {
      // Arrange
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      getSync2Iframe().contains("Try out Sync2-lite");
    });

    it("shows me a new success message after the tx has been mined", () => {
      // Arrange
      cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
      cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
        req.reply({
          statusCode: 200,
          body: {
            payload: {
              txid: "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b",
              signer: account,
            },
          },
        });
      }).as("signTxRes");
      cy.intercept(
        "GET",
        "https://testnet.veblocks.net/transactions/0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b/receipt?head=*",
        (req) => {
          req.reply({
            gasUsed: 28938,
            gasPayer: account,
            paid: "0x4041593a91a4000",
            reward: "0x1346cdf7f87e000",
            reverted: false,
            meta: {
              blockID:
                "0x010576bc63c0198ac62c2114479551346178550dba3bee19a4a8c118ede80550",
              blockNumber: 17135292,
              blockTimestamp: 1701384290,
              txID: "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b",
              txOrigin: account,
            },
            outputs: [
              {
                contractAddress: null,
                events: [
                  {
                    address: chain.trader,
                    topics: [
                      "0x7cf7f245e0ac9ee076d209114cedb03ee23c22f397ad7c400bfc99bbfa885933",
                      "0x00000000000000000000000073c6ad04b4cea2840a6f0c69e4ecace694d3444d",
                    ],
                    data: "0x0000000000000000000000000000000000000000000000008ac7230489e80000",
                  },
                ],
                transfers: [],
              },
            ],
          });
        },
      ).as("signTxReceipt");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      cy.wait(["@signTxReq", "@signTxRes", "@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("protocol-is-enabled-message", { timeout: 20_000 }).should(
        "be.visible",
      );
      cy.getByCy("protocol-is-enabled-message").within(() => {
        cy.getByCy("reserve-balance-amount").contains("10 VTHO");
      });
    });

    it("shows me an error message if the tx is rejected", () => {
      // Arrange
      cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
      cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
        req.reply({
          statusCode: 200,
          body: {
            payload: {
              txid: "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b",
              signer: account,
            },
          },
        });
      }).as("signTxRes");
      cy.intercept(
        "GET",
        "https://testnet.veblocks.net/transactions/0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b/receipt?head=*",
        (req) => {
          req.reply({
            gasUsed: 28938,
            gasPayer: account,
            paid: "0x4041593a91a4000",
            reward: "0x1346cdf7f87e000",
            reverted: true, // <- tx has been reverted
            meta: {
              blockID:
                "0x010576bc63c0198ac62c2114479551346178550dba3bee19a4a8c118ede80550",
              blockNumber: 17135292,
              blockTimestamp: 1701384290,
              txID: "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b",
              txOrigin: account,
            },
            outputs: [
              {
                contractAddress: null,
                events: [
                  {
                    address: chain.trader,
                    topics: [
                      "0x7cf7f245e0ac9ee076d209114cedb03ee23c22f397ad7c400bfc99bbfa885933",
                      "0x00000000000000000000000073c6ad04b4cea2840a6f0c69e4ecace694d3444d",
                    ],
                    data: "0x0000000000000000000000000000000000000000000000008ac7230489e80000",
                  },
                ],
                transfers: [],
              },
            ],
          });
        },
      ).as("signTxReceipt");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      cy.wait(["@signTxReq", "@signTxRes", "@fetchAllowance", "@fetchReserveBalance"]);
      cy.getByCy("network-error", { timeout: 20_000 }).contains(
        "The transaction has been reverted.",
      );
    });
  });
});
