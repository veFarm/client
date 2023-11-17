/// <reference types="cypress" />

Cypress.Commands.add("getByData", (selector) => {
  return cy.get(`[data-cy=${selector}]`);
});

Cypress.Commands.add('clickOutside', () => {
  return cy.get('body').click(0,0); // 0,0 here are the x and y coordinates
});
