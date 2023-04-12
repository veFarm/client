import type { ConnexService } from "@/blockchain/connex-service";
import type { AbiItem } from "@/typings/types";
import * as artifact from "@/abis/VTHO.json";

const VTHO_CONTRACT_ADDRESS = import.meta.env.VITE_VTHO_CONTRACT_ADDRESS;

if (VTHO_CONTRACT_ADDRESS == null) {
  throw new Error("Missing env var VTHO_CONTRACT_ADDRESS");
}

/**
 * Interface to interact with the VTHO ABI.
 */
export class VTHO {
  private readonly methods: Record<string, Connex.Thor.Account.Method> = {};

  constructor(private readonly connexService: ConnexService) {
    this.methods = this.connexService.getMethods({
      abi: artifact.abi as AbiItem[],
      address: VTHO_CONTRACT_ADDRESS,
    });
  }

  async totalSupply(): Promise<string> {
    const totalSupply = await this.methods.totalSupply.call();
    return totalSupply.decoded[0];
  }

  approve({
    spender,
    amount,
  }: {
    spender: Address;
    amount: string;
  }): Connex.VM.Clause {
    return this.methods.approve.asClause(spender, amount);
  }

  async allowance({
    owner,
    spender,
  }: {
    owner: Address;
    spender: Address;
  }): Promise<string> {
    const allowance = await this.methods.allowance.call(owner, spender);
    return allowance.decoded[0];
  }
}
