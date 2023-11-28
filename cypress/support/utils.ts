/// <reference types="cypress" />

export function getSync2Iframe(): Cypress.Chainable {
  return cy
    .get("iframe", { timeout: 10_000 })
    .eq(1)
    .its("0.contentDocument.body")
    .then(cy.wrap);
}
