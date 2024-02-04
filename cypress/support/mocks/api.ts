/// <reference types="cypress" />

import { responseHandler } from "cypress/support/utils";

/**
 * Factory to intercept and mock API calls aimed to our BE.
 */
export function makeApi(account: Address) {
  /**
   * Mock getaccountstats api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  function mockGetAccountStats(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/getaccountstats?account=${account}*`,
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
  function mockGetAccountSwaps(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/getaccountswaps?account=${account}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }

  /**
   * Mock gettradesforecast api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  function mockGetTradesForecast(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/gettradesforecast?account=${account}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }

  return Object.freeze({
    mockGetAccountStats,
    mockGetAccountSwaps,
    mockGetTradesForecast,
  });
}
