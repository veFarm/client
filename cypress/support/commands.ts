/// <reference types="cypress" />

Cypress.Commands.add(
  "getByCy",
  (
    selector: string,
    options?:
      | Partial<
          Cypress.Loggable &
            Cypress.Timeoutable &
            Cypress.Withinable &
            Cypress.Shadow
        >
      | undefined,
  ): Cypress.Chainable => {
    return cy.get(`[data-cy=${selector}]`, options);
  },
);

Cypress.Commands.add("clickOutside", (): Cypress.Chainable => {
  return cy.get("body").click(0, 0); // 0,0 here are the x and y coordinates
});

export {}
