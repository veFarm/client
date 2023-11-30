/// <reference types="cypress" />

import { chain } from "@/config/index";
import { getSync2Iframe } from "../support/utils";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

describe("Logged in NOT registered POSITIVE balance account", () => {
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
    });

    // Simulate a positive balance account.
    cy.intercept("GET", `https://testnet.veblocks.net/accounts/${account.toLowerCase()}*`, {
      statusCode: 200,
      body: {
        balance: "0x140330221654a06b3e9",
        energy:  "0x66b7d9428d2c776f6",
        hasCode: false,
      },
    }).as("fetchBalance");

    // Stub the first 2 RPC method calls.
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
          console.log("FETCH VTHO ALLOWANCE", counters.allowance);
          const data =
            counters.allowance === 0
              ? "0x0000000000000000000000000000000000000000000000000000000000000000"
              : "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
              // ^ 2^256 - 1 VHTO

          // ^ allowance is not 2^256 - 1
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
          const data =
            counters.reserveBalance === 0
              ? "0x0000000000000000000000000000000000000000000000000000000000000000"
              : "0x0000000000000000000000000000000000000000000000004563918244f40000";
              // ^ 5 VTHO

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

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  xit("does NOT show me the stats", () => {
    // TODO
  });

  it("shows me the header with my VET balance and address", () => {
    // Arrange

    // Act

    // Assert
    cy.wait("@fetchBalance")
    cy.getByCy("navigation-bar").contains("5906.63 VET");
    cy.getByCy("open-dropdown-button").contains("0x9702…90e0");
  });

  it("shows me the disconnect wallet button as enabled", () => {
    // Arrange

    // Act
    cy.getByCy("open-dropdown-button").click();

    // Assert
    cy.getByCy("disconnect-wallet-button").should("be.visible");
    cy.getByCy("disconnect-wallet-button").should("be.enabled");
  });

  it("disconnects me when I hit the disconnect wallet button", () => {
    // Arrange

    // Act
    cy.getByCy("open-dropdown-button").click();
    cy.getByCy("disconnect-wallet-button").click();

    // Assert
    cy.getByCy("connect-wallet-button").should("be.visible");
    cy.getByCy("connect-wallet-button").should("be.enabled");
  });

  it("does NOT show me the connect wallet button", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("connect-wallet-button").should("not.exist");
  });

  it("shows me 'You don't have any past trades'", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("trades-history-section").contains(
      "You don't have any past trades",
    );
  });

  it("keeps me connected when I refresh the page", () => {
    // Arrange

    // Act
    cy.reload();

    // Assert
    cy.wait("@fetchBalance")
    cy.getByCy("navigation-bar").contains("5906.63 VET");
    cy.getByCy("open-dropdown-button").contains("0x9702…90e0");
  });

  it("allows me to enter a reserve balance amount", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("reserve-balance-input").should("be.visible");
    cy.getByCy("reserve-balance-input").should("be.enabled");
  });

  it("shows me my VTHO balance inside the reserve balance input field", () => {
    // Arrange

    // Act

    // Assert
    cy.wait("@fetchBalance")
    cy.getByCy("subtext").contains("Balance: 118.42");
  });

  it("does NOT allow me to submit the form if I enter 0 as the reserve balance amount", () => {
    // Arrange
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").type("0");

    // Assert
    cy.getByCy("submit-form-button").should("be.disabled");
  });

  it("does NOT allow me to submit the form until I enter a positive reserve balance amount", () => {
    // Arrange
    cy.getByCy("submit-form-button").should("be.visible");
    cy.getByCy("submit-form-button").should("be.disabled");

    // Act
    cy.getByCy("reserve-balance-input").type("10");

    // Assert
    cy.getByCy("submit-form-button").should("be.enabled");
  });

  it("does NOT show me a 'lack of funds' alert and a link to the faucet", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("lack-of-funds-alert").should("not.exist");
    cy.getByCy("faucet-link").should("not.exist");
  });

  it("shows me the trades forecast after entering the reserve balance", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").type("10");

    // Assert
    cy.getByCy("trades-forecast-table").should("be.visible");
  });

  it("disables the submit button and shows a spinner after submitting the form", () => {
    // Arrange
    cy.getByCy("reserve-balance-input").type("10");

    // Act
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.getByCy("submit-form-button").should("be.disabled");
    cy.getByCy("submit-form-button").within(() => {
      cy.getByCy("spinner").should("be.visible");
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
    cy.getByCy("protocol-is-enabled-message").should("not.exist")
    cy.getByCy("reserve-balance-input").type("5");

    // Act
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.wait(["@signTxReq", "@signTxRes"]);
    cy.getByCy("protocol-is-enabled-message", { timeout: 20_000 }).should("be.visible")
  });

  it.only("shows and error message if the tx is rejected", () => {
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
    cy.getByCy("protocol-is-enabled-message").should("not.exist")
    cy.getByCy("reserve-balance-input").type("5");

    // Act
    cy.getByCy("reserve-balance-input").type("{enter}");

    // Assert
    cy.wait(["@signTxReq", "@signTxRes"]);
    cy.getByCy("network-error", { timeout: 20_000 }).contains("The transaction has been reverted.")
  })
});
