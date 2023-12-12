import bn from "bignumber.js";
import { getChainData } from "@vearnfi/config"
import config from "@/config/get-env-vars";

const { getEnvVars } = config;

const { CHAIN_ID } = getEnvVars();

export const chain = getChainData(CHAIN_ID)

// "115792089237316195423570985008687907853269984665640564039457584007913129639935"
export const MAX_UINT256 = bn(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
).toFixed();
