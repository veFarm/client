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
  private readonly methods: Record<string, Connex.Thor.Account.Method>;

  constructor(private readonly connexService: ConnexService) {
    this.methods = this.connexService.getMethods({
      abi: artifact.abi as AbiItem[],
      address: VTHO_CONTRACT_ADDRESS,
    });
  }

  /**
   * Returns the total VTHO supply.
   */
  async totalSupply(): Promise<string> {
    const totalSupply = await this.methods.totalSupply.call();
    return totalSupply.decoded[0];
  }

  /**
   * Returns the account balance in VTHO for the given address.
   * @param account Account whose balance needs to be checked.
   * @returns VTHO balance.
   */
  async balanceOf({ account }: { account: Address }): Promise<string> {
    const balanceOf = await this.methods.balanceOf.call(account);
    return balanceOf.decoded[0];
  }

  /**
   * Allows `spender` to withdraw from your account multiple times, up to the given `amount`.
   * If this function is called again it overwrites the current allowance with `amount`.
   * @param spender Account to be granted approval.
   * @param amount Amount of tokens to be approved for transfer.
   * @returns Approve clause.
   */
  approve({
    spender,
    amount,
  }: {
    spender: Address;
    amount: string;
  }): Connex.VM.Clause {
    return this.methods.approve.asClause(spender, amount);
  }

  /**
   * Returns the amount which `spender` is still allowed to withdraw from `owner`.
   * @param owner Account owner of the tokens.
   * @param spender Account that has been given allowance to spend the tokens.
   */
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
