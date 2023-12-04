/// <reference types="cypress" />

import { chain } from "@/config/index";

export const ZERO_ALLOWANCE =  "0x0000000000000000000000000000000000000000000000000000000000000000"
export const MAX_ALLOWANCE =  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

/**
 * Class to intercept and mock API calls aimed to the VThor blockchain.
 */
export class Connex {
  constructor(private readonly account: Address){}

  mockFetchBalance(vet: string, vtho: string) {
    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/accounts/${this.account.toLowerCase()}*`,
      {
        statusCode: 200,
        body: {
          balance: vet,
          energy: vtho,
          hasCode: false,
        },
      },
    )
  }

  /**
   * Mock VTHO allowance lookup.
   * @param {string | [string, string]} allowance
   * @return Mocked request
   */
  mockFetchVTHOAllowance(allowance: string | [string, string]) {
    let counter = 0
    console.log("VTHO allowance")

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.vtho.toLowerCase()) {
          console.log("FETCH ALLOWANCE")
          const data = typeof allowance === "string"
          ? allowance
          : counter === 0
              ? allowance[0]
              : allowance[1];

          req.reply({
            statusCode: 200,
            body: [
              {
                data,
                events: [],
                transfers: [],
                gasUsed: 904,
                reverted: false,
                vmError: "",
              },
            ],
          });

          counter++
          return;
        }

        // Forward all other requests down the pipe.
        console.log("PASS VTHO")
        // req.continue();
      },
    )
  }

  /**
   * Mock Trader reserveBalance lookup.
   * @param {string | [string, string]} allowance
   * @return Mocked request
   */
  mockFetchTraderReserve(reserveBalance: string | [string, string]) {
    let counter = 0
    console.log("Trader reserve")

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.trader.toLowerCase()) {
          console.log("FETCH TRADER RESERVE BALANCE", counter);
          const data = typeof reserveBalance === "string"
          ? reserveBalance
          : counter === 0
              ? reserveBalance[0]
              : reserveBalance[1];

          req.reply({
            statusCode: 200,
            body: [
              {
                data,
                events: [],
                transfers: [],
                gasUsed: 936,
                reverted: false,
                vmError: "",
              },
            ],
          });

          counter++;
          return;
        }

        console.log("PASS Trader")
        // Forward all other requests down the pipe.
        // req.continue();
      },
    )
  }
}
