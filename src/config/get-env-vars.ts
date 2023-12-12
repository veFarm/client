import type { ChainId } from "@vearnfi/config"

/**
 * Utility function to read and validate environment variables.
 * @return {{
 * CHAIN_ID: string,
 * }} Environment variables
 */
function getEnvVars() {
  const CHAIN_ID: ChainId = window.Cypress
    ? (100011 as const)
    : import.meta.env.VITE_CHAIN_ID;

  if (CHAIN_ID == null) {
    throw new Error("Missing env var CHAIN_ID");
  }

  return {
    CHAIN_ID,
  };
}

export default {
  getEnvVars,
};
