import bn from "bignumber.js";
import type { Connex } from "@vechain/connex";
import type { Certificate } from "thor-devkit";
import type { AbiItem } from "@/typings/types";

export type Contract = {
  methods: {
    constant: Record<string, (args: any[]) => Promise<any>>;
    signed: Record<
      string,
      (args: any[], comment: string) => Promise<Connex.Vendor.TxResponse>
    >;
    clause: Record<string, (args: any[]) => Connex.VM.Clause>;
  };
  events: Record<string, Connex.Thor.Account.Event>;
};

/**
 * Utility functions built around the connex library.
 * @todo Create an npm package so that we can reuse this logic
 * in both client and server.
 */
export class ConnexUtils {
  /**
   * Establishes a connection with the blockchain.
   */
  constructor(private readonly connex: Connex) {}

  /**
   * Implements constant method.
   * @param {Address} address Smart contract address.
   * @param {AbiItem} method ABI method.
   * @return {*} Method
   */
  private defineConstant(
    address: Address,
    method: AbiItem,
  ): (args: any[]) => Promise<Record<string | number, any>> {
    return async (args: any[]) => {
      const res = await this.connex.thor
        .account(address)
        .method(method)
        .call(...args);

      return res.decoded;
    };
  }

  /**
   * Implements signed method.
   * @param {Address} address Smart contract address.
   * @param {AbiItem} method ABI method.
   * @return {*} Method
   */
  private defineSignedRequest(
    address: Address,
    method: AbiItem,
  ): (args: any[], comment: string) => Promise<Connex.Vendor.TxResponse> {
    return async (args: any[], comment: string) => {
      const clause = this.connex.thor
        .account(address)
        .method(method)
        .asClause(...args);

      return this.connex.vendor.sign("tx", [clause]).comment(comment).request();
    };
  }

  /**
   * Defines method clause.
   * @param {Address} address Smart contract address.
   * @param {AbiItem} method ABI method.
   * @return {*} Method
   */
  defineClause(
    address: Address,
    method: AbiItem,
  ): (args: any[]) => Connex.VM.Clause {
    return (args: any[]) => {
      return this.connex.thor
        .account(address)
        .method(method)
        .asClause(...args);
    };
  }

  /**
   * Creates an interface to interact with a smart contract methods
   * deployed at the given address.
   * @param {AbiItem[]} abi Smart contract's ABI.
   * @param {Address} address Smart contract's address.
   * @return {Contract} Contract object.
   */
  getContract(abi: AbiItem[], address: Address): Contract {
    const contract: Contract = {
      methods: { constant: {}, signed: {}, clause: {} },
      events: {},
    };

    for (const item of abi) {
      if (item.name != null && item.type === "function") {
        if (item.stateMutability === "view") {
          contract.methods.constant[item.name] = this.defineConstant(
            address,
            item,
          );
        } else {
          contract.methods.signed[item.name] = this.defineSignedRequest(
            address,
            item,
          );
          contract.methods.clause[item.name] = this.defineClause(address, item);
        }
      } else if (item.name != null && item.type === "event") {
        contract.events[item.name] = this.connex.thor
          .account(address)
          .event(item);
      }
    }

    return contract;
  }

  /**
   * Sign certificate to prove account's ownership.
   * @param {string} message Message to be displayed when signing the certificate.
   * @return Signed certificate.
   */
  async signCert(message: Connex.Vendor.CertMessage): Promise<Certificate> {
    const certResponse = await this.connex.vendor
      .sign("cert", message)
      // .link(window.location.host)
      .request();

    const cert: Certificate = {
      purpose: message.purpose,
      payload: message.payload,
      domain: certResponse.annex.domain,
      timestamp: certResponse.annex.timestamp,
      signer: certResponse.annex.signer,
      signature: certResponse.signature,
    };

    return cert;
  }

  /**
   * Requests a signature for a transaction made of a given set of clauses.
   * @param {Connex.VM.Clause[]} clauses Clauses array.
   * @param {Address} signer Signer address.
   * @param {string} comment Signature comment.
   * @return {Promise<Connex.Vendor.TxResponse>} Transaction response.
   */
  async signTx(
    clauses: Connex.VM.Clause[],
    signer: Address,
    comment = "Sign transaction",
  ): Promise<Connex.Vendor.TxResponse> {
    return (
      this.connex.vendor
        .sign("tx", clauses)
        .signer(signer)
        // .link("https://connex.vecha.in/{txid}") // User will be back to the app by the url https://connex.vecha.in/0xffff....
        .comment(comment)
        .request()
    );
  }

  /**
   * Waits for the transaction to be confirmed.
   * @param {string} txId Transaction ID.
   * @param {number} iterations Maximum number of blocks to wait for
   * transaction confirmation before throwing.
   * @return {Promise<Connex.Thor.Transaction.Receipt>} Transaction receipt.
   * @throws When transaction not found or reverted.
   */
  async waitForReceipt(
    txId: string,
    iterations = 5,
  ): Promise<Connex.Thor.Transaction.Receipt> {
    const ticker = this.connex.thor.ticker();

    for (let i = 0; ; i++) {
      if (i >= iterations) {
        throw new Error("Transaction not found.");
      }

      await ticker.next();

      const receipt = await this.connex.thor.transaction(txId).getReceipt();

      if (receipt?.reverted) {
        throw new Error("The transaction has been reverted.");
      }

      if (receipt) {
        return receipt;
      }
    }
  }

  /**
   * Return current block.
   * @return {Promise<Connex.Thor.Block>} Current block.
   */
  async getCurrentBlock(): Promise<Connex.Thor.Block> {
    const currentBlock = await this.connex.thor.block().get();

    if (currentBlock == null) {
      throw new Error("currentBlock is undefined");
    }

    return currentBlock;
  }

  /**
   * Return transaction associated to the given transaction id.
   * @param {string} txId Transaction id.
   * @return {Promise<Connex.Thor.Transaction>} Transaction.
   */
  async getTransaction(txId: string): Promise<Connex.Thor.Transaction | null> {
    return this.connex.thor.transaction(txId).get();
  }

  /**
   * Fetch VET and VTHO account balance.
   * @param {Address} account Account to be checked.
   * @return VET and VTHO account balance.
   */
  async fetchBalance(account: Address): Promise<{ vet: string; vtho: string }> {
    const { balance, energy } = await this.connex.thor.account(account).get();

    return {
      vet: bn(balance).dividedBy(bn("1e18")).toFixed(2).toString(),
      vtho: bn(energy).dividedBy(bn("1e18")).toFixed(2).toString(),
    };
  }
}

// export class ConnexService {
//   private readonly connex: Connex;

//   /**
//    * Instantiate connex for the selected chain.
//    */
//   // constructor(opts: Pick<Options, "noV1Compat" | "noExtension">) {
//   //   this.connex = new Connex({
//   //     node: chain.rpc[0],
//   //     network: chain.network,
//   //     ...opts,
//   //   });
//   // }

//   /**
//    * Loop over connex.thor.account.methods to get an object
//    * containing all methods for the given ABI.
//    * @param abi ABI of the smart contract.
//    * @param address Address of the smart contract.
//    * @returns Methods object.
//    */
//   // getMethods({
//   //   abi,
//   //   address,
//   // }: {
//   //   abi: AbiItem[];
//   //   address: Address;
//   // }): Record<string, Connex.Thor.Account.Method> {
//   //   const methods: Record<string, Connex.Thor.Account.Method> = {};

//   //   for (const item of abi) {
//   //     // TODO: what about events?
//   //     if (item.name != null && item.type === "function") {
//   //       methods[item.name] = this.connex.thor.account(address).method(item);
//   //     }
//   //   }

//   //   return methods;
//   // }

//   /**
//    * Sign transaction for the given set of clauses.
//    * @param clauses Clauses array.
//    * @param signer Signer address.
//    * @param comment Signature comment.
//    * @returns Transaction object.
//    */
//   // async signTx({
//   //   clauses,
//   //   signer,
//   //   comment = "Sign transaction",
//   // }: {
//   //   clauses: Connex.VM.Clause[];
//   //   signer: Address;
//   //   comment?: string;
//   // }): Promise<Connex.Vendor.TxResponse> {
//   //   return (
//   //     this.connex.vendor
//   //       .sign("tx", clauses)
//   //       .signer(signer)
//   //       // .link("https://connex.vecha.in/{txid}") // User will be back to the app by the url https://connex.vecha.in/0xffff....
//   //       .comment(comment)
//   //       .request()
//   //   );
//   // }

//   /**
//    * Wait for TX to be included into the blockchain.
//    * @param txID Transaction ID.
//    * @param iterations Number of blocks to wait for transaction confirmation.
//    * @returns Transaction receipt or throws when transaction not found or reverted.
//    */
//   // async waitForTx({
//   //   txID,
//   //   iterations = 5,
//   // }: {
//   //   txID: string;
//   //   iterations?: number;
//   // }): Promise<Connex.Thor.Transaction.Receipt> {
//   //   const ticker = this.connex.thor.ticker();

//   //   for (let i = 0; ; i++) {
//   //     if (i >= iterations) {
//   //       throw new Error("Transaction not found.");
//   //     }

//   //     await ticker.next();

//   //     const receipt = await this.connex.thor.transaction(txID).getReceipt();

//   //     if (receipt?.reverted) {
//   //       throw new Error("The transaction has been reverted.");
//   //     }

//   //     if (receipt) {
//   //       return receipt;
//   //     }
//   //   }
//   // }

//   /**
//    * Sign certificate to prove account's ownership.
//    * @param message Message to be displayed when signing the certificate.
//    * @returns Signed certificate.
//    */
//   // async signCert({
//   //   message,
//   // }: {
//   //   message: Connex.Vendor.CertMessage;
//   // }): Promise<Certificate> {
//   //   const certResponse = await this.connex.vendor
//   //     .sign("cert", message)
//   //     .request();

//   //   const cert: Certificate = {
//   //     purpose: message.purpose,
//   //     payload: message.payload,
//   //     domain: certResponse.annex.domain,
//   //     timestamp: certResponse.annex.timestamp,
//   //     signer: certResponse.annex.signer,
//   //     signature: certResponse.signature,
//   //   };

//   //   return cert;
//   // }

//   /**
//    * Fetch VET and VTHO account balance.
//    * @param account Account to be checked.
//    * @returns Object containing (VET) `balance` and (VTHO) `energy`.
//    */
//   // async getBalance({
//   //   account,
//   // }: {
//   //   account: Address;
//   // }): Promise<{ balance: string; energy: string }> {
//   //   const balances = await this.connex.thor.account(account).get();
//   //   return {
//   //     balance: bn(balances.balance)
//   //       .dividedBy(bn("1e18"))
//   //       .toFixed(2)
//   //       .toString(),
//   //     energy: bn(balances.energy)
//   //       .dividedBy(bn("1e18"))
//   //       .toFixed(2)
//   //       .toString(),
//   //   };
//   // }
// }
