declare global {
  interface Window {
    vechain?: any;
  }

  type Address = `0x${string}`;
}

export {};
