/// <reference types="cypress" />

import { chain } from "@/config/index";

export const ZERO_ALLOWANCE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MAX_ALLOWANCE =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export type TxStatus = "reverted" | "mined";

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

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.vtho.toLowerCase()) {
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

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.trader.toLowerCase()) {
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

  /**
   * Mock an update reserve balance tx receipt.
   * @param {string} txId Transaction id.
   * @param {TxStatus} txStatus Transaction status.
   * @returns
   */
  mockUpdateReserveBalanceTxReceipt(txId: string, txStatus: TxStatus) {
    const reverted = txStatus === "reverted";

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/transactions/${txId}/receipt?head=*`,
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
            txID: txId,
            txOrigin: this.account,
          },
          outputs: reverted
            ? []
            : [
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

  /**
   * Mock a revoke allowance tx receipt.
   * @param {string} txId Transaction id.
   * @param {TxStatus} txStatus Transaction status.
   * @returns
   */
  mockRevokeAllowanceTxReceipt(txId: string, txStatus: TxStatus) {
    const reverted = txStatus === "reverted";

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/transactions/${txId}/receipt?head=*`,
      (req) => {
        req.reply({
          gasUsed: 26485,
          gasPayer: this.account,
          paid: "0x3acefabf8c32000",
          reward: "0x11a47e6caa0f000",
          reverted,
          meta: {
            blockID:
              "0x01059f3449f47f2016aee233fe2409266877b0ef7f327f5da5c224e1d5b6dc07",
            blockNumber: 17145652,
            blockTimestamp: 1701487890,
            txID: txId,
            txOrigin: this.account,
          },
          outputs: reverted
            ? []
            : [
                {
                  contractAddress: null,
                  events: [
                    {
                      address: chain.vtho,
                      topics: [
                        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                        "0x00000000000000000000000073c6ad04b4cea2840a6f0c69e4ecace694d3444d",
                        "0x0000000000000000000000000317b19b8b94ae1d5bfb4727b9064fe8118aa305",
                      ],
                      data: "0x0000000000000000000000000000000000000000000000000000000000000000",
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
