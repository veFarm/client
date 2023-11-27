/// <reference types="cypress" />
import { chain } from "@/config/index";

/**
 * user journeys:
 * 1. Happy path: new account, zero balance, lands on the app, logs in and registers, updates reserve balance, revokes approval and logs out.
 * 2. Happy path: new account, non-zero balance, lands on the app, logs in and registers, updates reserve balance, revokes approval and logs out.
 * It should see:
 * - no trades
 * - zero stats
 * - [grab test tokens from faucet alert] // only applies to journey #1
 * - reserve balance input should be enabled
 * When reserve balance input is filled she should see:
 * - trades forecast
 * After registration she should see:
 * - Success message
 * - update reserve button
 * - revoke approval
 * On logout she should see the initial page
 * 3. Logged in accounts refreshes the page and should stay logged in.
 */

const walletId = "sync2";
const account = "0x4f2b95775434b297a7205cb609ccab56752fc0b3";

describe("Logged in NOT registered account", () => {
  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visit("/");

    // Simulate a logged in account.
    localStorage.setItem("user", JSON.stringify({ walletId, account }));

    // Intercept backend calls to simulate a not registered account
    // (account record not found on DB).
    cy.intercept("GET", `**/getaccountstats?account=${account}*`, {
      statusCode: 404,
    });

    cy.intercept("GET", `**/getaccountswaps?account=${account}*`, {
      statusCode: 404,
    });

    // Stub RPC method calls.
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
                data: "0x0000000000000000000000000000000000000000000000000000000000000000",
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
          req.reply({
            statusCode: 200,
            body: [
              {
                data: "0x0000000000000000000000000000000000000000000000000000000000000000",
                events: [],
                transfers: [],
                gasUsed: 936,
                reverted: false,
                vmError: "",
              },
            ],
          });

          return;
        }

        // Forward all other requests to the original endpoint.
        req.continue();
      },
    );
  });

  context("Zero balance account", () => {
    beforeEach(() => {
      // Simulate a zero balance account.
      cy.intercept("GET", `https://testnet.veblocks.net/accounts/${account}*`, {
        statusCode: 200,
        body: {
          balance: "0x0000000000000000000", //"0x197ae6a1354ccd2e103",
          energy: "0x00000000000000000", // "0x12e492627f439cdc8"
          hasCode: false,
        },
      });

      // cy.getByCy("reserve-balance-input").as("reserve-balance-input");
    });

    it("shows me the title of the app and a short description", () => {
      // Arrange

      // Act

      // Assert
      cy.getByCy("title").should("be.visible");
      cy.getByCy("description").should("be.visible");
    });

    it("shows me the header with my VET balance and address", () => {
      // Arrange

      // Act

      // Assert
      cy.getByCy("navigation-bar").contains("0.00 VET");
      cy.getByCy("open-dropdown-button").contains("0x4f2b…c0b3");
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

    it("keeps me connected when I refresh the page", () => {
      // Arrange

      // Act
      cy.visit("/");

      // Assert
      cy.getByCy("navigation-bar").contains("0.00 VET");
      cy.getByCy("open-dropdown-button").contains("0x4f2b…c0b3");
    });

    it("allows me to enter a reserve balance amount", () => {
      // Arrange

      // Act

      // Assert
      cy.getByCy("reserve-balance-input").should("be.visible");
      cy.getByCy("reserve-balance-input").should("be.enabled");
    });

    it("does NOT allow me to submit the form until I enter a reserve balance amount", () => {
      // Arrange
      cy.getByCy("submit-form-button").should("be.visible");
      cy.getByCy("submit-form-button").should("be.disabled");

      // Act
      cy.getByCy("reserve-balance-input").type("10");

      // Assert
      cy.getByCy("submit-form-button").should("be.enabled");
    });

    it.skip("Shows the reserve balance field as enabled", () => {
      // Arrange

      // spying and response stubbing
      cy.intercept("GET", `https://testnet.veblocks.net/accounts/${account}*`, {
        statusCode: 200,
        body: {
          balance: "0x0000000000000000000", //"0x197ae6a1354ccd2e103",
          energy: "0x00000000000000000", // "0x12e492627f439cdc8"
          hasCode: false,
        },
      });

      cy.intercept("GET", `**/getaccountstats?account=${account}*`, {
        fixture: "account-stats.json",
      });
      //       cy.intercept('GET', `/getaccountstats?account=${account}*`, (req) => {
      //   req.reply({
      //     statusCode: 200,
      //     fixture: 'account-stats.json'
      //   })
      // })

      cy.intercept("GET", `**/getaccountswaps?account=${account}*`, {
        fixture: "account-swaps.json",
      });
    });

    it.skip("Happy path new (logged in) account zero balance", () => {
      // Arrange

      cy.intercept("GET", `**/getaccountstats?account=${account}*`, {
        fixture: "account-stats.json",
      });
      //       cy.intercept('GET', `/getaccountstats?account=${account}*`, (req) => {
      //   req.reply({
      //     statusCode: 200,
      //     fixture: 'account-stats.json'
      //   })
      // })

      cy.intercept("GET", `**/getaccountswaps?account=${account}*`, {
        fixture: "account-swaps.json",
      });

      // Assert
      // cy.get("@reserve-balance-input").should("be.visible");
      // cy.get("@reserve-balance-input").should("be.enabled");
    });
  });
});
