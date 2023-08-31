import type { Connex } from "@vechain/connex";
import bn from "bignumber.js";
import { getEnvVars } from "@/utils/get-env-vars";

const { CHAIN_ID } = getEnvVars();

// TODO: see devnet config https://docs.vechain.org/connex/connex#or-connect-to-a-private-network

/**
 * JavaScript CAIP-2 representation object.
 * @see https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
 */
export type ChainData = {
  name: string;
  chain: string;
  network: "main" | "test" | Connex.Thor.Block; // TODO: add support for devnet
  rpc: string[];
  faucets: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  icon?: string;
  explorers: {
    name: string;
    url: string;
    icon?: string;
    standard: string;
  }[];
};

/**
 * @link https://github.com/ethereum-lists/chains
 */
export const CHAINS: Record<100009 | 100010, ChainData> = {
  100009: {
    name: "VeChain",
    chain: "VeChain",
    network: "main",
    rpc: ["https://mainnet.veblocks.net/"],
    faucets: [],
    nativeCurrency: {
      name: "VeChain",
      symbol: "VET",
      decimals: 18,
    },
    infoURL: "https://vechain.org",
    shortName: "vechain",
    chainId: 100009,
    networkId: 100009,
    explorers: [
      {
        name: "VeChain Stats",
        url: "https://vechainstats.com",
        standard: "none",
      },
      {
        name: "VeChain Explorer",
        url: "https://explore.vechain.org",
        standard: "none",
      },
    ],
  },
  100010: {
    name: "VeChain Testnet",
    chain: "VeChain",
    network: "test",
    rpc: ["https://testnet.veblocks.net/"],
    faucets: ["https://faucet.vecha.in"],
    nativeCurrency: {
      name: "VeChain",
      symbol: "VET",
      decimals: 18,
    },
    infoURL: "https://vechain.org",
    shortName: "vechain-testnet",
    chainId: 100010,
    networkId: 100010,
    explorers: [
      {
        name: "VeChain Explorer",
        url: "https://explore-testnet.vechain.org",
        standard: "none",
      },
    ],
  },
};

// This is the same address for all environments.
export const VTHO_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000456E65726779" as Address;

export const chain = CHAINS[CHAIN_ID];

// "115792089237316195423570985008687907853269984665640564039457584007913129639935"
export const MAX_UINT256 = bn(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
).toFixed();
