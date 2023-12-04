/// <reference types="cypress" />

/**
 * Class to intercept and mock API calls aimed to our BE.
 */
export class API {
  constructor(private readonly account: Address){}

  mockGetAccountStats(response?: any) {
    return cy.intercept("GET", `**/getaccountstats?account=${this.account}*`, response);
  }

  mockGetAccountSwaps(response?: any) {
    return cy.intercept("GET", `**/getaccountswaps?account=${this.account}*`, response);
  }

  mockGetTradeForecast(response?: any) {
    return cy.intercept("GET", `**/gettradeforecast?account=${this.account}*`, response);
  }
}
