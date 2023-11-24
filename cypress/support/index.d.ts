declare namespace Cypress {
  interface Chainable {
    getByCy(string): Chainable;
    clickOutside(): void;
  }
}
