/// <reference types="cypress" />

import { getSync2Iframe } from "../support/utils";

const account = "0x2057ca7412e6c0828501cb7b335e166f81c58d26";

describe("Logged out account", () => {
  before(() => {});

  beforeEach(() => {
    cy.viewport("macbook-15");

    // Ensure account is NOT connected.
    cy.clearLocalStorage();
    // ^ Actually this is not required; Cypress does this
    // by default when test isolation is enabled.

    cy.visit("/");

    cy.getByCy("reserve-balance-input").as("reserve-balance-input");
    cy.getByCy("connect-wallet-button").as("connect-button");
  });

  it("shows me the title of the app and a short description", () => {
    // Arrange

    // Act

    // Assert
    cy.getByCy("title").should("be.visible");
    cy.getByCy("description").should("be.visible");
  });

  it("does not allow me to enter a reserve balance", () => {
    // Arrange

    // Act

    // Assert
    cy.get("@reserve-balance-input").should("be.visible");
    cy.get("@reserve-balance-input").should("be.disabled");
  });

  it("shows me the connect wallet button as enabled", () => {
    // Arrange

    // Act

    // Assert
    cy.get("@connect-button").should("be.visible");
    cy.get("@connect-button").should("be.enabled");
  });

  it("opens up the connect wallet modal when I click the connect button", () => {
    // Arrange

    // Act
    cy.get("@connect-button").click();

    // Assert
    cy.getByCy("wallet-modal").should("be.visible");
    cy.getByCy("wallet-provider-button-sync2").should("be.visible");
    cy.getByCy("wallet-provider-button-veworld").should("be.visible");
  });

  it("closes the connect wallet modal when I hit the close button", () => {
    // Arrange
    cy.get("@connect-button").click();
    cy.getByCy("wallet-modal").should("be.visible");

    // Act
    cy.getByCy("close-modal-button").click();

    // Assert
    cy.getByCy("wallet-modal").should("not.exist");
  });

  it("closes the connect wallet modal when I click on the backdrop", () => {
    // Arrange
    cy.get("@connect-button").click();
    cy.getByCy("wallet-modal").as("wallet-modal");
    cy.get("@wallet-modal").should("be.visible");

    // Act
    cy.get("@wallet-modal").clickOutside();

    // Assert
    cy.get("@wallet-modal").should("not.exist");
  });

  it("closes the connect wallet modal when I hit ESC", () => {
    // Arrange
    cy.get("@connect-button").click();
    cy.getByCy("wallet-modal").should("be.visible");

    // Act
    cy.get("body").type("{esc}");

    // Assert
    cy.getByCy("wallet-modal").should("not.exist");
  });

  it("shows me an error message when trying to connect with VeWorld but the extension is not detected", () => {
    // Arrange
    global.window.vechain = undefined;

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-veworld").click();

    // Assert
    cy.getByCy("wallet-modal-error")
      .should("be.visible")
      .and("contain", "VeWorld extension not detected.");
  });

  it("shows me a spinner when I click the connect sync2 button", () => {
    // Arrange

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    cy.getByCy("wallet-provider-button-sync2").should("be.disabled");
    cy.getByCy("wallet-provider-button-sync2").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });

  xit("shows me a spinner when I click the connect VeWorld button", () => {
    // Arrange
    window.vechain = {}; // should we stub it?

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-veworld").click();

    // Assert
    cy.getByCy("wallet-provider-button-veworld").should("be.disabled");
    cy.getByCy("wallet-provider-button-veworld").within(() => {
      cy.getByCy("spinner").should("be.visible");
    });
  });

  it("sends a sign cert request after hitting the Sync2 button", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signCertReq");

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    cy.wait("@signCertReq").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("cert");
      expect(payload.message.purpose).to.equal("identification");
      expect(payload.message.payload.content).to.equal(
        "Sign a certificate to prove your identity.",
      );
    });
  });

  it("opens the sync2 buddy when trying to connect with Sync2", () => {
    // Arrange

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    getSync2Iframe().contains("Try out Sync2-lite");
  });

  it("logs me in after signing the certificate", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signCertReq");
    cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            annex: {
              domain: "127.0.0.1:5173",
              signer: account,
              timestamp: 1701217618,
            },
            signature:
              "0x353d78959165e3fe35b97bcd738d116f5567fab6e4d1c339a02f9aa48a27379b3785356e34886ec9596a53d840e848d4e6caa255d05e84544b777ab501a0a20f01",
          },
        },
      });
    }).as("signCertRes");

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    cy.wait("@signCertReq");
    cy.wait("@signCertRes");
    cy.contains("Your Trades");
    // ^ Indicates that the account logged in successfully
  });

  it("errors if I provide an INVALID certificate", () => {
    // Arrange
    cy.intercept("POST", "https://tos.vecha.in/*").as("signCertReq");
    cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            annex: {
              domain: "127.0.0.1:5173",
              signer: account,
              timestamp: 1701217618,
            },
            signature:
              "0x053d78959165e3fe35b97bcd738d116f5567fab6e4d1c339a02f9aa48a27379b3785356e34886ec9596a53d840e848d4e6caa255d05e84544b777ab501a0a20f01",
            // ^ Replaced first digit to make and invalid certificate
          },
        },
      });
    }).as("signCertRes");

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    cy.wait("@signCertReq");
    cy.wait("@signCertRes");
    cy.getByCy("wallet-modal-error").contains("invalid point");
  });
});
