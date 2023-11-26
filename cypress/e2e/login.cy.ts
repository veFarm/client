import { Connex } from "@vechain/connex";

const getIframeDocument = (): Cypress.Chainable => {
  return (
    cy
      .get("iframe", { timeout: 10_000 })
      .eq(1)
      // Cypress yields jQuery element, which has the real
      // DOM element under property "0".
      // From the real DOM iframe element we can get
      // the "document" element, it is stored in "contentDocument" property
      // Cypress "its" command can access deep properties using dot notation
      // https://on.cypress.io/its
      .its("0.contentDocument")
      .should("exist")
  );
};

const getIframeBody = () => {
  // get the document
  return (
    getIframeDocument()
      // automatically retries until body is loaded
      .its("body")
      .should("be.visible")
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      .then(cy.wrap)
  );
};

describe("App", () => {
  before(() => {});

  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visit("/");
  });

  it("pops up sync2 when the user clicks on the connect sync2 button", () => {
    // Arrange
    // TODO: clear user data
    cy.clearLocalStorage();
    //     cy.intercept('https://testnet.veblocks.net/blocks/best', (req) => {
    //       /* do something with request and/or response */
    //         req.on('response', (res) => {
    //   // Wait for delay in milliseconds before sending the response to the client.
    //   res.setDelay(20_000)
    // })

    // })
    //     cy.intercept('https://tos.vecha.in/*', (req) => {
    //       /* do something with request and/or response */

    //         req.on('response', (res) => {
    //   // Wait for delay in milliseconds before sending the response to the client.
    //   res.setDelay(20_000)
    // })
    // })
    cy.getByData("connect-wallet-button").click();

    // Act
    cy.getByData("wallet-provider-button-sync2").click();

    // cy.stub(Connex.Vendor, "sign", )

    cy.window().then((win) => {
      cy.stub(win.connex?.vendor.sign)
        // .throws()
        .resolves(
          JSON.parse(
            '{"purpose":"identification","payload":{"type":"text","content":"Sign a certificate to prove your identity."},"domain":"127.0.0.1:5173","timestamp":1700433932,"signer":"0x0e520397aec29f6ab08046ef2681e5b40017aa12","signature":"0x36c513e64e1f82adea6aa8b025a76344930399456bc77bbe7efdfc7e7fec830f3945c64fd457f6c8a44459300555bb91aa0c0026515c606f3514ed34bd8240a101"}',
          ),
        );
    });

    cy.window().then((win) => {
      cy.spy(win, "open").as("windowOpen");
    });

    getIframeBody().contains("Try out Sync2-lite").click();

    cy.wait(2000);

    // cy.get('@windowOpen').should('be.calledWith', "https://lite.sync.vecha.in/#/sign?src=https%3A%2F%2Ftos.vecha.in%2F19618959919e7c546928d9328af48d28d01e15d2f04abfd48bb1370d6fa2ae0e", "sync|127.0.0.1:5173", "width=360,height=640,resizable,scrollbars=yes,dependent,modal")
    cy.get("@windowOpen").should("be.called");

    // cy.visit("https://lite.sync.vecha.in/#/sign?src=https%3A%2F%2Ftos.vecha.in%2F19618959919e7c546928d9328af48d28d01e15d2f04abfd48bb1370d6fa2ae0e")
    // cy.visit("https://lite.sync.vecha.in/#/sign?src=https%3A%2F%2Ftos.vecha.in%2F19618959919e7c546928d9328af48d28d01e15d2f04abfd48bb1370d6fa2ae0e")
    // cy.get("button").eq(1).click()

    // cy.visit('/')
    // cy.get("button").eq(1).click()
    // rpc: https://testnet.veblocks.net/

    // message: "{\"purpose\":\"identification\",\"payload\":{\"type\":\"text\",\"content\":\"Sign a certificate to prove your identity.\"}}"

    // cert: "{\"purpose\":\"identification\",\"payload\":{\"type\":\"text\",\"content\":\"Sign a certificate to prove your identity.\"},\"domain\":\"127.0.0.1:5173\",\"timestamp\":1700433932,\"signer\":\"0x0e520397aec29f6ab08046ef2681e5b40017aa12\",\"signature\":\"0x36c513e64e1f82adea6aa8b025a76344930399456bc77bbe7efdfc7e7fec830f3945c64fd457f6c8a44459300555bb91aa0c0026515c606f3514ed34bd8240a101\"}"

    // account: "0x0e520397aec29f6ab08046ef2681e5b40017aa12"

    // getIframeBody()
    // .find('div.footer')
    // // .should('exist')
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
});

// TODO: logged in user should stay logged in after refresh
