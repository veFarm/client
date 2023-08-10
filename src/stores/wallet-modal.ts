import { writable } from "svelte/store";

type State = {
  isOpen: boolean;
};

const initialState: State = {
  isOpen: false,
};

/**
 * Keeps track of wallet modal open/close state.
 */
function createStore() {
  const { subscribe, set } = writable<State>({ ...initialState });

  return {
    subscribe,
    open: function (): void {
      set({ isOpen: true });
    },
    close: function (): void {
      set({ isOpen: false });
    },
  };
}

export const walletModal = createStore();
