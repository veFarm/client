/// <reference types="cypress" />

import { chain } from "@/config/index";

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

    // Stub RPC method calls to simulate a revoke allowance situation.
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
        // Simulate VTHO allowance revoking.
        if (to.toLowerCase() === chain.vtho.toLowerCase()) {
          const data =
            counters.allowance === 0
              ? "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
              : // ^ 2^256 -1 VTHO
                "0x0000000000000000000000000000000000000000000000000000000000000000";
          // ^ 0 VTHO

          req.reply({
            statusCode: 200,
            body: [
              {
                data,
                events: [],
                transfers: [],
                gasUsed: 904,
                reverted: false,
                vmError: "",
              },
            ],
          });

          counters.allowance += 1;

          return;
        }

        // Stub Trader reserve balance lookup.
        if (to.toLowerCase() === chain.trader.toLowerCase()) {
          console.log("FETCH TRADER RESERVE BALANCE", counters.reserveBalance);

          req.reply({
            statusCode: 200,
            body: [
              {
                data: "0x0000000000000000000000000000000000000000000000004563918244f40000",
                // ^ 5 VTHO
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

  it("sends me a sign tx request after I click the revoke allowance button", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.wait("@fetchContract");

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

  it("shows me the initial screen after revoking allowance", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signTxReq");
    cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: "0xce47958b8c14484f5a39f361d02f244396f15dab0c73d49fc0a0bbaeceff3d98",
            signer: account,
          },
        },
      });
    }).as("signTxRes");
    cy.intercept(
      "GET",
      "https://testnet.veblocks.net/transactions/0xce47958b8c14484f5a39f361d02f244396f15dab0c73d49fc0a0bbaeceff3d98/receipt?head=*",
      (req) => {
        req.reply({
          gasUsed: 26485,
          gasPayer: account,
          paid: "0x3acefabf8c32000",
          reward: "0x11a47e6caa0f000",
          reverted: false,
          meta: {
            blockID:
              "0x01059f3449f47f2016aee233fe2409266877b0ef7f327f5da5c224e1d5b6dc07",
            blockNumber: 17145652,
            blockTimestamp: 1701487890,
            txID: "0xce47958b8c14484f5a39f361d02f244396f15dab0c73d49fc0a0bbaeceff3d98",
            txOrigin: account,
          },
          outputs: [
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
                  data: "0x0000000000000000000000000000000000000000000000000000000000000000",
                },
              ],
              transfers: [],
            },
          ],
        });
      },
    ).as("signTxReceipt");
    cy.wait("@fetchContract");
    cy.getByCy("revoke-allowance-button").should("be.enabled");

    // Act
    cy.getByCy("revoke-allowance-button").click();

    // Assert
    cy.wait(["@signTxReq", "@signTxRes", "@signTxReceipt"], {
      timeout: 20_000,
    });
    cy.getByCy("submit-form-button").should("be.visible");
  });
});
