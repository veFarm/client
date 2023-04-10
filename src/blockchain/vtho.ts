import type { ConnexService } from "@/blockchain/connex-service";
import type { AbiItem } from "@/typings/types";
import * as artifact from "@/artifacts/contracts/VTHO.sol/VTHO.json";

const VTHO_CONTRACT_ADDRESS = import.meta.env.VITE_VTHO_CONTRACT_ADDRESS;

if (VTHO_CONTRACT_ADDRESS == null) {
  throw new Error("Missing env var VTHO_CONTRACT_ADDRESS");
}

export class VTHO {
  private readonly methods: Record<string, Connex.Thor.Account.Method> = {};

  constructor(private readonly connexService: ConnexService) {
    this.methods = this.connexService.getMethods({
      abi: artifact.abi as AbiItem[],
      address: VTHO_CONTRACT_ADDRESS,
    });
  }

  async totalSupply(): Promise<
    Connex.VM.Output & Connex.Thor.Account.WithDecoded
  > {
    return this.methods.totalSupply.call();
  }

  approve({
    spender,
    amount,
  }: {
    spender: Address;
    amount: any; // TODO: amount should either be string or BN.
  }): Connex.VM.Clause {
    return this.methods.approve.asClause(spender, amount);
  }
}
