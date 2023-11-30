/// <reference types="cypress" />

import { chain } from "@/config/index";
import { getSync2Iframe } from "../support/utils";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

describe("Logged in REGISTERED POSITIVE balance account", () => {
  beforeEach(() => {
    cy.viewport("macbook-15");

    // Intercept backend calls to simulate a not registered account
    // (account record not found on DB).
    cy.intercept("GET", `**/getaccountstats?account=${account}*`, {
      statusCode: 404,
    });

    cy.intercept("GET", `**/getaccountswaps?account=${account}*`, {
      statusCode: 404,
    });

    cy.intercept("GET", `**/gettradeforecast?account=${account}*`, {
      fixture: "trades-forecast.json",
    }).as("getTradesForecast");

    // Simulate a positive balance account.
    cy.intercept(
      "GET",
      `https://testnet.veblocks.net/accounts/${account.toLowerCase()}*`,
      {
        statusCode: 200,
        body: {
          balance: "0x140330221654a06b3e9",
          energy: "0x66b7d9428d2c776f6",
          hasCode: false,
        },
      },
    ).as("fetchBalance");

    // Stub RPC method calls.
    let counters: Record<"allowance" | "reserveBalance", number> = {
      allowance: 0,
      reserveBalance: 0,
    };

    cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        // Stub VTHO allowance lookup.
        if (to.toLowerCase() === chain.vtho.toLowerCase()) {
          req.reply({
            statusCode: 200,
            body: [
              {
                data: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                events: [],
                transfers: [],
                gasUsed: 904,
                reverted: false,
                vmError: "",
              },
            ],
          });

          return;
        }

        // Stub Trader reserve balance lookup.
        if (to.toLowerCase() === chain.trader.toLowerCase()) {
          console.log("FETCH TRADER RESERVE BALANCE", counters.reserveBalance);
          const data =
            counters.reserveBalance === 0
              ? "0x0000000000000000000000000000000000000000000000004563918244f40000"
              : // ^ 5 VTHO
                "0x0000000000000000000000000000000000000000000000008ac7230489e80000";
          // ^ 10 VTHO

          req.reply({
            statusCode: 200,
            body: [
              {
                data,
                events: [],
                transfers: [],
                gasUsed: 936,
                reverted: false,
                vmError: "",
              },
            ],
          });

          counters.reserveBalance += 1;

          return;
        }

        // Forward all other requests to the original endpoint.
        req.continue();
      },
    ).as("fetchContract");

    // Simulate a logged in account.
    localStorage.setItem("user", JSON.stringify({ walletId, account }));

    cy.visit("/");
  });

  it("shows me a success message", () => {
    // Arrange
    cy.wait("@fetchContract");

    // Act

    // Assert
    cy.getByCy("protocol-is-enabled-message").should("be.visible");
    cy.getByCy("protocol-is-enabled-message").within(() => {
      cy.getByCy("reserve-balance-amount").contains("5 VTHO");
    });
  });

  it("shows me the trades forecast", () => {
    // Arrange
    cy.wait("@fetchContract");
    cy.wait("@getTradesForecast");

    // Act

    // Assert
    cy.getByCy("trades-forecast-table").should("be.visible");
  });

  it("shows me the update reserve balance button", () => {
    // Arrange
    cy.wait("@fetchContract");

    // Act

    // Assert
    cy.getByCy("goto-update-reserve-balance-button").should("be.visible");
    cy.getByCy("goto-update-reserve-balance-button").should("be.enabled");
  });

  it("shows me the revoke allowance button", () => {
    // Arrange
    cy.wait("@fetchContract");

    // Act

    // Assert
    cy.getByCy("revoke-allowance-button").should("be.visible");
    cy.getByCy("revoke-allowance-button").should("be.enabled");
  });

  it("shows me the update reserve balance form after hitting the update reserve balance button", () => {
    // Arrange
    cy.wait("@fetchContract");

    // Act
    cy.getByCy("goto-update-reserve-balance-button").click();

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  context("update reserve balance form", () => {
    it("shows me a cancel button that takes me to the back to success massage screen", () => {
      // Arrange
      cy.wait("@fetchContract");
      cy.getByCy("goto-update-reserve-balance-button").click();

      // Act
      cy.getByCy("cancel-reserve-balance-update-button").click();

      // Assert
      cy.getByCy("protocol-is-enabled-message").should("be.visible");
    });

    it("does NOT allow me to submit the form until I enter a new reserve balance amount", () => {
      // Arrange
      cy.wait("@fetchContract");
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
      cy.wait("@fetchContract");
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      cy.wait("@signTxReq").then((interception) => {
        const { type, payload } = interception.request.body;
        console.log({ body: interception.request.body });

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
      cy.wait("@fetchContract");
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      cy.wait(["@signTxReq", "@signTxRes", "@fetchContract"]);
      cy.getByCy("protocol-is-enabled-message", { timeout: 20_000 }).should(
        "be.visible",
      );
      cy.getByCy("protocol-is-enabled-message").within(() => {
        cy.getByCy("reserve-balance-amount").contains("10 VTHO");
      });
    });

    it.only("shows me an error message if the tx is rejected", () => {
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
      cy.wait("@fetchContract");
      cy.getByCy("goto-update-reserve-balance-button").click();
      cy.getByCy("update-reserve-balance-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").clear();
      cy.getByCy("reserve-balance-input").type("10");
      cy.getByCy("reserve-balance-input").type("{enter}");

      // Assert
      cy.wait(["@signTxReq", "@signTxRes", "@fetchContract"]);
      cy.getByCy("network-error", { timeout: 20_000 }).contains(
        "The transaction has been reverted.",
      );
    });
  });

  it("sends a sign tx request after submitting the form", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.getByCy("reserve-balance-input").type("5");

    // Act
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.wait("@signTxReq").then((interception) => {
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

  it("opens up the wallet after submitting the form", () => {
    // Arrange
    cy.getByCy("reserve-balance-input").type("10");

    // Act
    cy.getByCy("submit-form-button").click();

    // Assert
    getSync2Iframe().contains("Try out Sync2-lite");
  });

  it("shows me success message after the tx is mined", () => {
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223",
            signer: account,
          },
        },
      });
    }).as("signTxRes");
    cy.intercept(
      "GET",
      "https://testnet.veblocks.net/transactions/0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223/receipt?head=*",
      (req) => {
        req.reply({
          gasUsed: 86147,
          gasPayer: account,
          paid: "0xbf48e6696a7e000",
          reward: "0x3962ab860659000",
          reverted: false,
          meta: {
            blockID:
              "0x010553ef49b3bea9b39ecfc7066504f5632f4889cbf68cbd051281d69bea7ad2",
            blockNumber: 17126383,
            blockTimestamp: 1701295200,
            txID: "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223",
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
                  data: "0x0000000000000000000000000000000000000000000000004563918244f40000",
                },
              ],
              transfers: [],
            },
            {
              contractAddress: null,
              events: [
                {
                  address: chain.vtho,
                  topics: [
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                    "0x00000000000000000000000073c6ad04b4cea2840a6f0c69e4ecace694d3444d",
                    "0x0000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa305",
                  ],
                  data: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                },
              ],
              transfers: [],
            },
          ],
        });
      },
    ).as("signTxReceipt");
    cy.getByCy("protocol-is-enabled-message").should("not.exist");
    cy.getByCy("reserve-balance-input").type("5");

    // Act
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.wait(["@signTxReq", "@signTxRes"]);
    cy.getByCy("protocol-is-enabled-message", { timeout: 20_000 }).should(
      "be.visible",
    );
  });

  it("shows and error message if the tx is rejected", () => {
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223",
            signer: account,
          },
        },
      });
    }).as("signTxRes");
    cy.intercept(
      "GET",
      "https://testnet.veblocks.net/transactions/0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223/receipt?head=*",
      (req) => {
        req.reply({
          gasUsed: 86147,
          gasPayer: account,
          paid: "0xbf48e6696a7e000",
          reward: "0x3962ab860659000",
          reverted: true, // <-- tx has been rejected
          meta: {
            blockID:
              "0x010553ef49b3bea9b39ecfc7066504f5632f4889cbf68cbd051281d69bea7ad2",
            blockNumber: 17126383,
            blockTimestamp: 1701295200,
            txID: "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223",
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
                  data: "0x0000000000000000000000000000000000000000000000004563918244f40000",
                },
              ],
              transfers: [],
            },
            {
              contractAddress: null,
              events: [
                {
                  address: chain.vtho,
                  topics: [
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                    "0x00000000000000000000000073c6ad04b4cea2840a6f0c69e4ecace694d3444d",
                    "0x0000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa305",
                  ],
                  data: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                },
              ],
              transfers: [],
            },
          ],
        });
      },
    ).as("signTxReceipt");
    cy.getByCy("protocol-is-enabled-message").should("not.exist");
    cy.getByCy("reserve-balance-input").type("5");

    // Act
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.wait(["@signTxReq", "@signTxRes"]);
    cy.getByCy("network-error", { timeout: 20_000 }).contains(
      "The transaction has been reverted.",
    );
  });
});
