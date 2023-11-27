declare global {
  interface Window {
    vechain?: any;
    Cypress?: any;
  }

  type Address = `0x${string}`;
}

export {};
