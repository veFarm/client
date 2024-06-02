/// <reference types="cypress" />

import { responseHandler } from "cypress/support/utils";

/**
 * Factory to intercept and mock API calls aimed to our BE.
 */
export function makeApi(account: Address) {
  /**
   * Mock getuserstats api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  function mockGetUserStats(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/getuserstats?account=${account.toLowerCase()}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }

  /**
   * Mock getuserswaps api call.
   * @param {Object | [Object, Object]} response. Response or array of responses to be returned by the mock.
   * @returns
   */
  function mockGetUserSwaps(response: Object | [Object, Object]) {
    let index = 0;

    return cy.intercept(
      "GET",
      `**/getuserswaps?account=${account.toLowerCase()}*`,
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
      `**/gettradesforecast?account=${account.toLowerCase()}*`,
      (req) => {
        const res = responseHandler(response, index);

        req.reply(res);

        index++;
        return;
      },
    );
  }

  return Object.freeze({
    mockGetUserStats,
    mockGetUserSwaps,
    mockGetTradesForecast,
  });
}
