/// <reference types="cypress" />
import { chain } from "@/config/index";

const walletId = "sync2";
const account = "0x2057ca7412E6C0828501CB7b335E166f81c58D26";

describe("Logged in NOT registered ZERO balance account", () => {
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
      body: { txFee: "2688830000000000000", solutions: [] },
    });

    // Simulate a zero balance account.
    cy.intercept("GET", `https://testnet.veblocks.net/accounts/${account}*`, {
      statusCode: 200,
      body: {
        balance: "0x0000000000000000000", //"0x197ae6a1354ccd2e103",
        energy: "0x00000000000000000", // "0x12e492627f439cdc8"
        hasCode: false,
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
    cy.getByCy("navigation-bar").contains("0.00 VET");
    cy.getByCy("open-dropdown-button").contains("0x2057…8D26");
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
    cy.getByCy("navigation-bar").contains("0.00 VET");
    cy.getByCy("open-dropdown-button").contains("0x2057…8D26");
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

  it("shows me a 'lack of funds' alert and a link to the faucet", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("lack-of-funds-alert").should("be.visible");
    cy.getByCy("faucet-link").should("be.visible");
  });

  it("does NOT show me the trades forecast after entering the reserve balance", () => {
    // Arrange

    // Act
    cy.getByCy("reserve-balance-input").type("10");

    // Assert
    cy.getByCy("trades-forecast-table").should("not.exist");
  });

  it("shows me 'You don't have any past trades'", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("trades-history-section").contains(
      "You don't have any past trades",
    );
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
