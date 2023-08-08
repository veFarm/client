/**
 * Utility function to read and validate environment variables.
 * @return {{
 * CHAIN_ID: string,
 * VTHO_CONTRACT_ADDRESS: string,
 * TRADER_CONTRACT_ADDRESS: Address,
 * GET_ACCOUNT_SWAPS_ENDPOINT: string,
 * GET_STATS_ENDPOINT: string,
 * }} Environment variables
 */
export function getEnvVars() {
  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
  const VTHO_CONTRACT_ADDRESS = import.meta.env.VITE_VTHO_CONTRACT_ADDRESS;
  const TRADER_CONTRACT_ADDRESS = import.meta.env.VITE_TRADER_CONTRACT_ADDRESS;
  const GET_ACCOUNT_SWAPS_ENDPOINT = import.meta.env
    .VITE_GET_ACCOUNT_SWAPS_ENDPOINT;
  const GET_STATS_ENDPOINT = import.meta.env.VITE_GET_STATS_ENDPOINT;

  if (CHAIN_ID == null) {
    throw new Error("Missing env var CHAIN_ID");
  }
  if (VTHO_CONTRACT_ADDRESS == null) {
    throw new Error("Missing env var VTHO_CONTRACT_ADDRESS");
  }
  if (TRADER_CONTRACT_ADDRESS == null) {
    throw new Error("Missing env var TRADER_CONTRACT_ADDRESS");
  }
  if (GET_ACCOUNT_SWAPS_ENDPOINT == null) {
    throw new Error("Missing env var GET_ACCOUNT_SWAPS_ENDPOINT");
  }
  if (GET_STATS_ENDPOINT == null) {
    throw new Error("Missing env var GET_STATS_ENDPOINT");
  }

  return {
    CHAIN_ID,
    VTHO_CONTRACT_ADDRESS,
    TRADER_CONTRACT_ADDRESS,
    GET_ACCOUNT_SWAPS_ENDPOINT,
    GET_STATS_ENDPOINT,
  };
}
