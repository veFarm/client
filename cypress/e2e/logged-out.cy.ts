/// <reference types="cypress" />

const getSync2Iframe = (): Cypress.Chainable => {
  return cy
    .get("iframe", { timeout: 10_000 })
    .eq(1)
    .its("0.contentDocument.body")
    .then(cy.wrap);
};

describe("Logged out account", () => {
  before(() => {});

  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visit("/");

    // Ensure account is NOT connected.
    cy.clearLocalStorage();
    // ^ Actually this is not required; Cypress does this
    // by default when test isolation is enabled.

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

  xit("shows me a spinner when I click the connect sync2 button", () => {});

  xit("shows me a spinner when I click the connect VeWorld button", () => {});

  it("shows me the connect sync2 buddy when trying to connect with Sync2", () => {
    // Arrange

    // Act
    cy.get("@connect-button").click();
    cy.getByCy("wallet-provider-button-sync2").click();

    // Assert
    getSync2Iframe().contains("Try out Sync2-lite");
  });
});
