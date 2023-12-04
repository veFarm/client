/// <reference types="cypress" />

import { chain } from "@/config/index";

export const ZERO_ALLOWANCE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MAX_ALLOWANCE =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

/**
 * Class to intercept and mock API calls aimed to the VThor blockchain.
 */
export class Connex {
  constructor(private readonly account: Address) {}

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
    );
  }

  /**
   * Mock VTHO allowance lookup.
   * @param {string | [string, string]} allowance
   * @return Mocked request
   */
  mockFetchVTHOAllowance(allowance: string | [string, string]) {
    let counter = 0;
    console.log("VTHO allowance");

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.vtho.toLowerCase()) {
          console.log("FETCH ALLOWANCE");
          const data =
            typeof allowance === "string"
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

          counter++;
          return;
        }

        // Forward all other requests down the pipe.
      },
    );
  }

  /**
   * Mock Trader reserveBalance lookup.
   * @param {string | [string, string]} allowance
   * @return Mocked request
   */
  mockFetchTraderReserve(reserveBalance: string | [string, string]) {
    let counter = 0;
    console.log("Trader reserve");

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.trader.toLowerCase()) {
          console.log("FETCH TRADER RESERVE BALANCE", counter);
          const data =
            typeof reserveBalance === "string"
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

        // Forward all other requests down the pipe.
      },
    );
  }

  mockUpdateReserveBalanceTxReceipt(reverted = false) {
    return cy.intercept(
      "GET",
      "https://testnet.veblocks.net/transactions/0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b/receipt?head=*",
      (req) => {
        req.reply({
          gasUsed: 28938,
          gasPayer: this.account,
          paid: "0x4041593a91a4000",
          reward: "0x1346cdf7f87e000",
          reverted,
          meta: {
            blockID:
              "0x010576bc63c0198ac62c2114479551346178550dba3bee19a4a8c118ede80550",
            blockNumber: 17135292,
            blockTimestamp: 1701384290,
            txID: "0x30bb88830703234154f04c3dcff9b861e23523e543133aa875857243f006076b",
            txOrigin: this.account,
          },
          outputs: [
            {
              contractAddress: null,
              events: [
                {
                  address: chain.trader,
                  topics: [
                    "0x7cf7f245e0ac9ee076d209114cedb03ee23c22f397ad7c400bfc99bbfa885933",
                    "0x00000000000000000000000073c6ad04b4cea2840a6f0c69e4ecace694d3444d",
                  ],
                  data: "0x0000000000000000000000000000000000000000000000008ac7230489e80000",
                },
              ],
              transfers: [],
            },
          ],
        });
      },
    );
  }
}
