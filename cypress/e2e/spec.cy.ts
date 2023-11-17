const getIframeDocument = () => {
  return cy
  .get('iframe')
  .eq(1)
  // Cypress yields jQuery element, which has the real
  // DOM element under property "0".
  // From the real DOM iframe element we can get
  // the "document" element, it is stored in "contentDocument" property
  // Cypress "its" command can access deep properties using dot notation
  // https://on.cypress.io/its
  .its('0.contentDocument').should('exist')
}

const getIframeBody = () => {
  // get the document
  return getIframeDocument()
  // automatically retries until body is loaded
  .its('body').should('not.be.undefined')
  // wraps "body" DOM element to allow
  // chaining more Cypress commands, like ".find(...)"
  .then(cy.wrap)
}

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
      // TODO: Arrange user is not connected
      cy.getByData("reserve-input").should("be.visible");
      cy.getByData("reserve-input").should("be.disabled");
    });

    it("displays the connect wallet button when the user is NOT connected", () => {
      cy.getByData("connect-wallet-button").should("be.visible");
      cy.getByData("connect-wallet-button").should("not.be.disabled");
    });

    it("opens the connect wallet modal when the user clicks the connect button", () => {
      // TODO: Arrange user is not connected

      // Act
      cy.getByData("connect-wallet-button").click();

      // Assert
      cy.getByData("wallet-modal").should("be.visible");
    });

    it("closes the connect wallet modal when the user clicks the close button", () => {
      // Arrange
      cy.getByData("connect-wallet-button").click()
      cy.getByData("wallet-modal").should("be.visible");

      // Act
      cy.getByData("close-modal-button").click();

      // Assert
      cy.getByData("wallet-modal").should("not.exist");
    });

    it("closes the connect wallet modal when the user clicks on the backdrop", () => {
      // Arrange
      cy.getByData("connect-wallet-button").click()
      cy.getByData("wallet-modal").should("be.visible");

      // Act
      cy.getByData("wallet-modal").clickOutside();

      // Assert
      cy.getByData("wallet-modal").should("not.exist");
    });

    it("closes the connect wallet modal when the user hits ESC", () => {
      // Arrange
      cy.getByData("connect-wallet-button").click()
      cy.getByData("wallet-modal").should("be.visible");

      // Act
      cy.get('body').type('{esc}');

      // Assert
      cy.getByData("wallet-modal").should("not.exist");
    });

    it.only("pops up sync2 when the user clicks on the connect sync2 button", () => {
      // Arrange
      // TODO: clear user data
      cy.clearLocalStorage()
      cy.getByData("connect-wallet-button").click();

      // Act
      cy.getByData("wallet-provider-button-sync2").click();

      // Assert
      // cy.get('iframe')
      // .eq(1)
      // .should('contain', 'Try out Sync2-lite')
        getIframeBody()
        .find('div.footer')
        .should('not.be.undefined')
        .find('div')
        .should('not.be.undefined')
        .eq(1)
        .should('not.be.undefined')
        .find('a')
        .eq(0) // .get('a').eq(0).should('have.text', 'Try out Sync2-lite').click()
        // getIframeBody().find('#result').should('include.text', '"delectus aut autem"')

        //         getIframeBody()
        // .find('div.footer')
        // // .should('not.be.undefined')
        // .find('div')
        // .find('a')
        // .eq(0)
        // .should('contain', 'Try out Sync2-lite')
        // .click()


        // Account
        // 0x356D86Fa8Ed7611Da4bF2C8E1B76f06F961Be644

        // https://sync-mainnet.veblocks.net/accounts/0x356d86fa8ed7611da4bf2c8e1b76f06f961be644?revision=0x0102eaf14f738c2de6b51ba741a9a6edc8663e9eb87c3cb53d0ebd309c5aa983

        // POST https://testnet.veblocks.net/accounts/*?revision=0x0103ac14e9ab5039df23cea804d32c2bcda95c1f938920897d7c7d0e95f17b62

        // Balance
        // GET https://testnet.veblocks.net/accounts/0x67f14cca4851a1b3111463a4fe9cc86cde378766?revision=0x0103ac14e9ab5039df23cea804d32c2bcda95c1f938920897d7c7d0e95f17b62
        // resp {"balance":"0x0","energy":"0x0","hasCode":false}
    });

    it("display error message when VeWorld extension is not detected", () => {
      // Arrange
      global.window.vechain = undefined;

      // Act
      cy.getByData("connect-wallet-button").click();
      cy.getByData("wallet-provider-button-veworld").click();

      // Assert
      cy.getByData("wallet-modal-error")
      .should("be.visible")
      .and("contain",
        "VeWorld extension not detected.",
      );
    });
  });

  context("form section user IS connected", () => {});
});

// TODO: logged in user should stay logged in after refresh
