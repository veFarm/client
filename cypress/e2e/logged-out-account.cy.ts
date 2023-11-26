/// <reference types="cypress" />

describe("App - Logged out account journey", () => {
  before(() => {});

  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visit("/");

    // Ensure account is NOT logged in.
    cy.clearLocalStorage();
    // ^ Actually this is not required; Cypress does this
    // by default when test isolation is enabled.

    cy.getByData("reserve-input").as("reserve-input");
    cy.getByData("connect-wallet-button").as("connect-button");
  });

  context("Hero section", () => {
    it("displays the title of the app and a short description", () => {
      cy.getByData("title").should("be.visible");
      cy.getByData("description").should("be.visible");
    });
  });

  context("Form section", () => {
    it("Shows the reserve balance field as disabled", () => {
      // Assert
      cy.get("@reserve-input").should("be.visible");
      cy.get("@reserve-input").should("be.disabled");
    });

    it("Shows the connect wallet button as enabled", () => {
      // Assert
      cy.get("@connect-button").should("be.visible");
      cy.get("@connect-button").should("be.enabled");
    });

    it("Opens the connect wallet modal when the connect button is clicked", () => {
      // Act
      cy.get("@connect-button").click();

      // Assert
      cy.getByData("wallet-modal").should("be.visible");
    });

    it("Closes the connect wallet modal when the close button is clicked", () => {
      // Arrange
      cy.get("@connect-button").click();
      cy.getByData("wallet-modal").should("be.visible");

      // Act
      cy.getByData("close-modal-button").click();

      // Assert
      cy.getByData("wallet-modal").should("not.exist");
    });

    it("Closes the connect wallet modal when the backdrop is clicked", () => {
      // Arrange
      cy.get("@connect-button").click();
      cy.getByData("wallet-modal").as("wallet-modal");
      cy.get("@wallet-modal").should("be.visible");

      // Act
      cy.get("@wallet-modal").clickOutside();

      // Assert
      cy.get("@wallet-modal").should("not.exist");
    });

    it("Closes the connect wallet modal when the ESC key is pressed", () => {
      // Arrange
      cy.get("@connect-button").click();
      cy.getByData("wallet-modal").should("be.visible");

      // Act
      cy.get("body").type("{esc}");

      // Assert
      cy.getByData("wallet-modal").should("not.exist");
    });

    it("Displays an error message when VeWorld extension is not detected", () => {
      // Arrange
      global.window.vechain = undefined;

      // Act
      cy.get("@connect-button").click();
      cy.getByData("wallet-provider-button-veworld").click();

      // Assert
      cy.getByData("wallet-modal-error")
        .should("be.visible")
        .and("contain", "VeWorld extension not detected.");
    });
  });
});
