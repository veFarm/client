/// <reference types="cypress" />

import { responseHandler } from "cypress/support/utils";

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
  mockGetAccountStats(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/getaccountstats?account=${this.account}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }

  /**
   * Mock getaccountswaps api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  mockGetAccountSwaps(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/getaccountswaps?account=${this.account}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }

  /**
   * Mock gettradeforecast api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  mockGetTradeForecast(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/gettradeforecast?account=${this.account}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }
}
