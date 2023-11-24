/// <reference types="cypress" />

// import { Connex } from "@vechain/connex"
import bn from "bignumber.js"
import config from "../../src/config/get-env-vars";
// import { CHAINS } from "../../src/config/index"
// import { ConnexUtils } from "../../src/blockchain/connex-utils";
import walletStore from "../../src/stores/wallet"
// import * as walletModule from "../../src/stores/wallet"
// import * as testMod from "../../src/config/test-module"
// import * as testMod from "../../src/config/test-module"
// import testMod from "../../src/config/test-module"
// import importMod from "../../src/config/test-module"
// import {obj} from "../../src/config/test-module"
import obj from "../../src/config/test-module"

// const { wallet } = walletStore

// const obj = {
// importMod() {
//   return 3
// }
// }

const walletId = "sync2"
const account = "0x4f2b95775434b297a7205cb609ccab56752fc0b3"

describe("App - Logged in account journey", () => {
  before(() => {
  });

  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visit("/");

    // Ensure account is connected
    localStorage.setItem("user", JSON.stringify({ walletId, account }));

    // console.log({'props': testMod})
    console.log({'props': obj})
    // console.log({'props': importMod})

    // cy.stub(testMod, 'importMod').returns(5)
    // cy.stub(testMod, 'importMod').returns(5)
    cy.stub(obj, 'importMod').returns(5)
    // cy.stub(importMod).returns(5)
    // cy.getByData("reserve-input").as("reserve-input");
  });

  context("Hero section", () => {
    it("displays the title of the app and a short description", () => {
      // Arrange

      // Assert
      cy.getByCy("title").should("be.visible");
      cy.getByCy("description").should("be.visible");
    });
  });

  context("Form section", () => {
    it.only("Shows the reserve balance field as enabled", () => {
      // Arrange
      // cy.stub(getEnvVars).returns({ CHAIN_ID: 100010 })
      // Cypress.env('VITE_CHAIN_ID', 100010)
      // cy.stub(config, "getEnvVars").returns({ VITE_CHAIN_ID: 100010 })

      // const res = testMod.importMod()
      const res = obj.importMod()
      // const res = importMod()
      console.log({res})

      // spying and response stubbing
      cy.intercept('GET', `https://testnet.veblocks.net/accounts/${account}*`, {
        statusCode: 200,
        body: {
          balance: "0x0000000000000000000", //"0x197ae6a1354ccd2e103",
          energy:"0x00000000000000000", // "0x12e492627f439cdc8"
          hasCode: false,
        },
      })

      cy.intercept('GET', `**/getaccountstats?account=${account}*`, {fixture: 'account-stats.json'
})
//       cy.intercept('GET', `/getaccountstats?account=${account}*`, (req) => {
//   req.reply({
//     statusCode: 200,
//     fixture: 'account-stats.json'
//   })
// })

      cy.intercept('GET', `**/getaccountswaps?account=${account}*`,  {
          fixture: 'account-swaps.json'
      })

      // Request URL:
// res {}


      // const walletId = "sync2"

      // cy.stub(walletStore, "wallet").returns({
      //   // connexUtils,
      //   loading: false,
      //   error: undefined,
      //   connected: true,
      //   account: "0x2b0b892F1fa5568d9268de59b9C9d8d5a8b41707",
      //   balance: {
      //     vet: bn(0),
      //     vtho: bn(0),
      //   },
      //   walletId,
      //   baseGasPrice: bn(1000),
      // })


      // try {

      // const connex = new Connex({
      //   node: "https://testnet.veblocks.net/",
      //   network: "test",
      //   noExtension: walletId === "sync2",
      // });
      // } catch (error) {
      //   console.error(error)
      // }

      // const connexUtils = new ConnexUtils(connex)

      // cy.stub(walletStore, "wallet").returns({
      //   // connexUtils,
      //   loading: false,
      //   error: undefined,
      //   connected: true,
      //   account: "0x4f2b95775434b297a7205cb609ccab56752fc0b3",
      //   balance: {
      //     vet: bn(0),
      //     vtho: bn(0),
      //   },
      //   walletId,
      //   baseGasPrice: bn(1000),
      // })

      // const { wallet } = walletStore

      // console.log({account: wallet.account})
      // cy.wait(3_000)
      // TODO: mock balance, Trader.reserveBalance and VTHO.allowance

      // Assert
      // cy.get("@reserve-input").should("be.visible");
      // cy.get("@reserve-input").should("be.enabled");
    });

    it("Does NOT show the connect wallet button", () => {
      // Assert
      cy.getByCy("connect-wallet-button").should("not.exist");
    })

    // xit("Opens the connect wallet modal when the connect button is clicked", () => {
    //   // Act
    //   cy.get("@connect-button").click();

    //   // Assert
    //   cy.getByData("wallet-modal").should("be.visible");
    // });

    // xit("Closes the connect wallet modal when the close button is clicked", () => {
    //   // Arrange
    //   cy.get("@connect-button").click();
    //   cy.getByData("wallet-modal").should("be.visible");

    //   // Act
    //   cy.getByData("close-modal-button").click();

    //   // Assert
    //   cy.getByData("wallet-modal").should("not.exist");
    // });

    // xit("Closes the connect wallet modal when the backdrop is clicked", () => {
    //   // Arrange
    //   cy.get("@connect-button").click();
    //   cy.getByData("wallet-modal").as("wallet-modal");
    //   cy.get("@wallet-modal").should("be.visible");

    //   // Act
    //   cy.get("@wallet-modal").clickOutside();

    //   // Assert
    //   cy.get("@wallet-modal").should("not.exist");
    // });

    // xit("Closes the connect wallet modal when the ESC key is pressed", () => {
    //   // Arrange
    //   cy.get("@connect-button").click();
    //   cy.getByData("wallet-modal").should("be.visible");

    //   // Act
    //   cy.get("body").type("{esc}");

    //   // Assert
    //   cy.getByData("wallet-modal").should("not.exist");
    // });

    // xit("Displays an error message when VeWorld extension is not detected", () => {
    //   // Arrange
    //   global.window.vechain = undefined;

    //   // Act
    //   cy.get("@connect-button").click();
    //   cy.getByData("wallet-provider-button-veworld").click();

    //   // Assert
    //   cy.getByData("wallet-modal-error")
    //     .should("be.visible")
    //     .and("contain", "VeWorld extension not detected.");
    // });
  });
});
