/// <reference types="cypress" />

import { chain } from "@/config/index";
import { getSync2Iframe } from "../support/utils"

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

describe("Logged in NOT registered POSITIVE balance account", () => {
  beforeEach(() => {
    cy.viewport("macbook-15");

    // const stub = cy.stub().as('open')

    // cy.visit("/", {
    //   onBeforeLoad(win) {
    //     cy.stub(win, 'open').callsFake(stub)
    //       }
    // });
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

    cy.intercept("GET", `**/gettradeforecast?account=${account}*`, {
      statusCode: 200,
      body: {"txFee":"2688830000000000000","solutions":[{"protocolFee":"186933510000000000","dexFee":"186372709470000000","amountInWithFees":"61937863780530000000","deltaVET":"846378938892496129.55211548879635803739","stepsCount":14,"withdrawAmount":"65000000000000000000","totalProfitVET":"11849305144494945813.72961684314901252346"},{"protocolFee":"201933510000000000","dexFee":"201327709470000000","amountInWithFees":"66907908780530000000","deltaVET":"913694219064712040.63479537812498586253","stepsCount":13,"withdrawAmount":"70000000000000000000","totalProfitVET":"11878024847841256528.25233991562481621289"},{"protocolFee":"336933510000000000","dexFee":"335922709470000000","amountInWithFees":"111638313780530000000","deltaVET":"1515577829048343790.99517372255491032448","stepsCount":8,"withdrawAmount":"115000000000000000000","totalProfitVET":"12124622632386750327.96138978043928259584"},{"protocolFee":"456933510000000000","dexFee":"455562709470000000","amountInWithFees":"151398673780530000000","deltaVET":"2044680506719324509.06225691968801652127","stepsCount":6,"withdrawAmount":"155000000000000000000","totalProfitVET":"12268083040315947054.37354151812809912762"}]}
    });

    // Simulate a zero balance account.
    cy.intercept("GET", `https://testnet.veblocks.net/accounts/${account}*`, {
      statusCode: 200,
      body: {
        "balance":"0x140330221654a06b3e9","energy":"0x66b7d9428d2c776f6","hasCode":false
      },
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

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  xit("does NOT show me the stats", () => {
    // TODO
  })

  it("shows me the header with my VET balance and address", () => {
    // Arrange

    // Act

    // Assert
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

  it("keeps me connected when I refresh the page", () => {
    // Arrange

    // Act
    cy.reload();

    // Assert
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
    cy.getByCy("submit-form-button").should("be.disabled")
    cy.getByCy("submit-form-button").within(() => {
      cy.getByCy("spinner").should("be.visible")
    })
  })

  it("opens the wallet after submitting the form", () => {
    // Arrange
    cy.getByCy("reserve-balance-input").type("10");

    // Act
    cy.getByCy("submit-form-button").click()

    // Assert
    getSync2Iframe().contains("Try out Sync2-lite");
  })

  xit("shows me a spinner and a success message after submitting the form", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").type("10 {enter}");

    // Assert
  })

  it("shows me 'You don't have any past trades'", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("trades-history-section").contains(
      "You don't have any past trades",
    );
  });
});
