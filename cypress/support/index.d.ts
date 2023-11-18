declare namespace Cypress {
  interface Chainable {
    getByData(string): Chainable
    clickOutside(): void
  }
}

