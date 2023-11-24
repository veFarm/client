/**
 * Utility function to read and validate environment variables.
 * @return {{
 * CHAIN_ID: string,
 * }} Environment variables
 */
function getEnvVars() {
  // const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || 100011;
  const CHAIN_ID = 100011;

  if (CHAIN_ID == null) {
    throw new Error("Missing env var CHAIN_ID");
  }

  return {
    CHAIN_ID,
  };
}

export default {
  getEnvVars,
}
