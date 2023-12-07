/// <reference types="cypress" />

/**
 * Class to intercept and mock API calls aimed to our BE.
 */
export class API {
  constructor(private readonly account: Address) {}

  /**
   * Mock getaccountstats api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  mockGetAccountStats(response?: Object | [Object, Object]) {
    let counter = 0;

    return cy.intercept(
      "GET",
      `**/getaccountstats?account=${this.account}*`,
      (req) => {
        const res = !Array.isArray(response)
          ? response
          : counter === 0
          ? response[0]
          : response[1];

        req.reply(res);
      },
    );
  }

  /**
   * Mock getaccountswaps api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  mockGetAccountSwaps(response?: Object | [Object, Object]) {
    let counter = 0;

    return cy.intercept(
      "GET",
      `**/getaccountswaps?account=${this.account}*`,
      (req) => {
        const res = !Array.isArray(response)
          ? response
          : counter === 0
          ? response[0]
          : response[1];

        req.reply(res);
      },
    );
  }

  /**
   * Mock gettradeforecast api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  mockGetTradeForecast(response?: Object | [Object, Object]) {
    let counter = 0;

    return cy.intercept(
      "GET",
      `**/gettradeforecast?account=${this.account}*`,
      (req) => {
        const res = !Array.isArray(response)
          ? response
          : counter === 0
          ? response[0]
          : response[1];

        req.reply(res);
      },
    );
  }
}
