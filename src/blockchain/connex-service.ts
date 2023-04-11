import { Connex, Options } from "@vechain/connex";
import type { Certificate } from "thor-devkit";
import type { AbiItem } from "@/typings/types";
import { chain } from "@/config";

export class ConnexService {
  private readonly connex: Connex;

  /**
   * Instantiate connex for the selected chain.
   */
  constructor(opts: Pick<Options, "noV1Compat" | "noExtension">) {
    this.connex = new Connex({
      node: chain.rpc[0],
      network: chain.network,
      ...opts,
    });
  }

  /**
   * Loop over connex.thor.account.methods to get an object
   * containing all methods for the given ABI.
   * @param abi Smart contract's ABI.
   * @param address Smart contract's address.
   * @returns Methods object.
   */
  getMethods({
    abi,
    address,
  }: {
    abi: AbiItem[];
    address: Address;
  }): Record<string, Connex.Thor.Account.Method> {
    const methods: Record<string, Connex.Thor.Account.Method> = {};

    for (const item of abi) {
      // TODO: what about events?
      if (item.name != null && item.type === "function") {
        methods[item.name] = this.connex.thor.account(address).method(item);
      }
    }

    return methods;
  }

  /**
   * Sign transaction for the given set of clauses.
   * @param clauses Clauses array.
   * @param signer Signer address.
   * @param comment Signature comment.
   * @returns Transaction object.
   */
  async signTx({
    clauses,
    signer,
    comment = "Sign transaction",
  }: {
    clauses: Connex.VM.Clause[];
    signer: Address;
    comment?: string;
  }): Promise<Connex.Vendor.TxResponse> {
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
   * Wait for TX to be included into the blockchain.
   * @param txID Transaction ID.
   * @param iterations Number of blocks to wait for transaction confirmation.
   * @returns Transaction receipt or throws when transaction not found or reverted.
   */
  async waitForTx({
    txID,
    iterations = 5,
  }: {
    txID: string;
    iterations?: number;
  }): Promise<Connex.Thor.Transaction.Receipt> {
    const ticker = this.connex.thor.ticker();

    for (let i = 0; ; i++) {
      if (i >= iterations) {
        throw new Error("Transaction not found.");
      }

      await ticker.next();

      const receipt = await this.connex.thor.transaction(txID).getReceipt();

      if (receipt?.reverted) {
        throw new Error("The transaction has been reverted.");
      }

      if (receipt) {
        return receipt;
      }
    }
  }

  /**
   * Sign certificate to prove account's ownership.
   * @param message Message to be displayed when signing the certificate.
   * @returns Signed certificate.
   */
  async signCert(message: Connex.Vendor.CertMessage): Promise<Certificate> {
    const certResponse = await this.connex.vendor
      .sign("cert", message)
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
}
