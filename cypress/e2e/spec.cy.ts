describe("App", () => {
  before(() => {});

  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visit("http://127.0.0.1:5173/");
  });

  context("hero section", () => {
    it("displays the title of the app and a short description", () => {
      cy.getByData("title").should("be.visible");
      cy.getByData("description").should("be.visible");
    });
  });

  context("form section user is NOT connected", () => {
    it("disables the reserve balance field when the user is NOT connected", () => {
      cy.getByData("reserve-input").should("be.visible");
      cy.getByData("reserve-input").should("be.disabled");
    });

    it("displays the connect wallet button when the user is NOT connected", () => {
      cy.getByData("connect-wallet-button").should("be.visible");
      cy.getByData("connect-wallet-button").should("not.be.disabled");
    });

    it("opens the connect wallet modal when the user clicks the connect button", () => {
      cy.getByData("connect-wallet-button").click();
    });

    it("closes the connect wallet modal when the user clicks the close button", () => {
      cy.getByData("connect-wallet-button").click();
      cy.getByData("close-modal-button").click();
    });

    it("closes the connect wallet modal when the user clicks on the backdrop", () => {
      // TODO
    });

    it("pops up sync2 when the user clicks on the connect sync2 button", () => {
      cy.getByData("connect-wallet-button").click();
      cy.getByData("wallet-provider-button-sync2").click();
    });

    it.only("display error message when VeWorld extension is not detected", () => {
      // Arrange
      global.window.vechain = undefined;

      // Act
      cy.getByData("connect-wallet-button").click();
      cy.getByData("wallet-provider-button-veworld").click();

      // Assert
      cy.getByData("wallet-modal-error-message").contains(
        "VeWorld extension not detected.",
      );
    });
  });

  context("form section user IS connected", () => {});
});
