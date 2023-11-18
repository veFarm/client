/// <reference types="cypress" />

Cypress.Commands.add("getByData", (selector): Cypress.Chainable => {
  return cy.get(`[data-cy=${selector}]`);
});

Cypress.Commands.add('clickOutside', (): Cypress.Chainable => {
  return cy.get('body').click(0,0); // 0,0 here are the x and y coordinates
});
