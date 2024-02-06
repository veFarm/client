/// <reference types="cypress" />

import { chain } from "@/config/index";
import { responseHandler } from "cypress/support/utils";

export const VTHO_AMOUNT = {
  ZERO: "0x0000000000000000000000000000000000000000000000000000000000000000",
  FIVE: "0x0000000000000000000000000000000000000000000000004563918244f40000",
  TEN: "0x0000000000000000000000000000000000000000000000008ac7230489e80000",
  MAX: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
};

type Balance = {
  vet: string;
  vtho: string;
};

export const BALANCE: Record<string, Balance> = {
  ZERO: {
    vet: "0x0000000000000000000",
    vtho: "0x00000000000000000",
  },
  POSITIVE: {
    vet: "0x140330221654a06b3e9",
    vtho: "0x66b7d9428d2c776f6",
  },
  UPDATED: {
    vet: "0x1b1ae4d6e2ef500000",
    vtho: "0x2b0d094b561bcf000",
  },
};

export type TxStatus = "reverted" | "mined";

type Balance = {
  vet: string;
  vtho: string;
};

/**
 * Factory to intercept and mock API calls aimed to the VThor blockchain.
 */
export function makeConnex(account: Address) {
  /**
   * Mock account balance lookup.
   * @param {Balance | [Balance,Balance]} balance. Mocked balance or balance array to simulate a change of state.
   * @returns
   */
  function mockFetchBalance(balance: Balance | [Balance, Balance]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/accounts/${account.toLowerCase()}*`,
      (req) => {
        const { vet, vtho } = responseHandler(balance, index);

        req.reply({
          statusCode: 200,
          body: {
            balance: vet,
            energy: vtho,
            hasCode: false,
          },
        });

        index++;
        return;
      },
    );
  }

  /**
   * Mock VTHO allowance lookup.
   * @param {string | [string, string]} allowance Allowance to be returned by the mock.
   * @return Mocked request
   */
  function mockFetchVTHOAllowance(allowance: string | [string, string]) {
    let index = 0;

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.vtho.toLowerCase()) {
          const data = responseHandler(allowance, index);

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

          index++;
          return;
        }

        // Forward all other requests down the pipe.
      },
    );
  }

  /**
   * Mock Trader reserveBalance lookup.
   * @param {string | [string, string]} reserveBalance Reserve balance to be returned by the mock.
   * @return Mocked request
   */
  function mockFetchTraderReserve(reserveBalance: string | [string, string]) {
    let index = 0;

    return cy.intercept(
      "POST",
      "https://testnet.veblocks.net/accounts/*?revision=*",
      (req) => {
        const to = req?.body?.clauses[0]?.to;

        if (to.toLowerCase() === chain.trader.toLowerCase()) {
          const data = responseHandler(reserveBalance, index);

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

          index++;
          return;
        }

        // Forward all other requests down the pipe.
      },
    );
  }

  /**
   * Mock update reserve balance tx receipt.
   * @param {string} txId Transaction id.
   * @param {TxStatus} txStatus Transaction status.
   * @returns
   */
  function mockUpdateReserveBalanceTxReceipt(txId: string, txStatus: TxStatus) {
    const reverted = txStatus === "reverted";

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/transactions/${txId}/receipt?head=*`,
      (req) => {
        req.reply({
          gasUsed: 28938,
          gasPayer: account,
          paid: "0x4041593a91a4000",
          reward: "0x1346cdf7f87e000",
          reverted,
          meta: {
            blockID:
              "0x010576bc63c0198ac62c2114479551346178550dba3bee19a4a8c118ede80550",
            blockNumber: 17135292,
            blockTimestamp: 1701384290,
            txID: txId,
            txOrigin: account,
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
   * Mock revoke allowance tx receipt.
   * @param {string} txId Transaction id.
   * @param {TxStatus} txStatus Transaction status.
   * @returns
   */
  function mockRevokeAllowanceTxReceipt(txId: string, txStatus: TxStatus) {
    const reverted = txStatus === "reverted";

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/transactions/${txId}/receipt?head=*`,
      (req) => {
        req.reply({
          gasUsed: 26485,
          gasPayer: account,
          paid: "0x3acefabf8c32000",
          reward: "0x11a47e6caa0f000",
          reverted,
          meta: {
            blockID:
              "0x01059f3449f47f2016aee233fe2409266877b0ef7f327f5da5c224e1d5b6dc07",
            blockNumber: 17145652,
            blockTimestamp: 1701487890,
            txID: txId,
            txOrigin: account,
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

  /**
   * Mock register tx receipt.
   * @param {string} txId Transaction id.
   * @param {TxStatus} txStatus Transaction status.
   * @returns
   */
  function mockRegisterTxReceipt(txId: string, txStatus: TxStatus) {
    const reverted = txStatus === "reverted";

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/transactions/${txId}/receipt?head=*`,
      (req) => {
        req.reply({
          gasUsed: 86147,
          gasPayer: account,
          paid: "0xbf48e6696a7e000",
          reward: "0x3962ab860659000",
          reverted,
          meta: {
            blockID:
              "0x010553ef49b3bea9b39ecfc7066504f5632f4889cbf68cbd051281d69bea7ad2",
            blockNumber: 17126383,
            blockTimestamp: 1701295200,
            txID: "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223",
            txOrigin: account,
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
                      data: "0x0000000000000000000000000000000000000000000000004563918244f40000",
                    },
                  ],
                  transfers: [],
                },
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
                      data: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
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
   * Mock approve allowance tx receipt.
   * @param {string} txId Transaction id.
   * @param {TxStatus} txStatus Transaction status.
   * @returns
   */
  function mockApproveAllowanceTxReceipt(txId: string, txStatus: TxStatus) {
    const reverted = txStatus === "reverted";

    return cy.intercept(
      "GET",
      `https://testnet.veblocks.net/transactions/${txId}/receipt?head=*`,
      (req) => {
        req.reply({
          gasUsed: 47209,
          gasPayer: account,
          paid: "0x68d335a9003a000",
          reward: "0x1f72901919ab000",
          reverted,
          meta: {
            blockID:
              "0x0106032640c2767e7a2e418d7835a7812d246f5b9915fd914558787a6d22196d",
            blockNumber: 17171238,
            blockTimestamp: 1701743750,
            txID: txId,
            txOrigin: "0x73c6ad04b4cea2840a6f0c69e4ecace694d3444d",
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
                      data: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                    },
                  ],
                  transfers: [],
                },
              ],
        });
      },
    );
  }

  return Object.freeze({
    mockFetchBalance,
    mockFetchVTHOAllowance,
    mockFetchTraderReserve,
    mockUpdateReserveBalanceTxReceipt,
    mockRevokeAllowanceTxReceipt,
    mockRegisterTxReceipt,
    mockApproveAllowanceTxReceipt,
  });
}
