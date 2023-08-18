import type { Connex } from "@vechain/connex";
import type { Certificate } from "thor-devkit";
import { Transaction } from "thor-devkit";
import bn from "bignumber.js";
import type { AbiItem } from "@/typings/types";
import { formatUnits } from "@/utils/format-units";
import * as paramsArtifact from "@/artifacts/Params.json";

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
   * Creates ConnexUtils instance given a connex connection.
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
   * @return VET and VTHO account balance in decimals.
   */
  async fetchBalance(account: Address): Promise<{ vet: string; vtho: string }> {
    const { balance, energy } = await this.connex.thor.account(account).get();

    return {
      vet: formatUnits(balance, 2),
      vtho: formatUnits(energy, 2),
    };
  }

  /**
   * Fetch the Params VeChain smart contract to ge the current base gas price.
   * @see {@link https://docs.vechain.org/tutorials/Useful-tips-for-building-a-dApp.html#_6-estimate-the-transaction-fee}
   * @return {string} Base gas price.
   */
  async fetchBaseGasPrice(): Promise<string> {
    // Create an instance of the VeChain Params contract.
    const contract = this.getContract(
      paramsArtifact.abi as AbiItem[],
      // Params contract address for both main and test nets.
      "0x0000000000000000000000000000506172616d73",
    );

    const decoded = await contract.methods.constant.get([
      // 0x000000…696365 is the key of baseGasPrice https://docs.vechain.org/others/miscellaneous.html#key-of-governance-params
      "0x000000000000000000000000000000000000626173652d6761732d7072696365",
    ]);

    return decoded[0];
  }

  /**
   * Estimate units of gas used to execute the given set of clauses.
   * @see https://github.com/vechain/connex/blob/c00bfc1abec3572c7d1df722bf8a7dfb14295102/packages/driver/src/driver.ts#L165
   */
  async estimateGas(
    clauses: Connex.VM.Clause[],
    signer?: Address,
  ): Promise<number> {
    let explainer = this.connex.thor.explain(clauses);

    if (signer) {
      explainer = explainer.caller(signer);
    }

    const output = await explainer.execute();
    const executionGas = output.reduce((sum, out) => sum + out.gasUsed, 0);

    const intrinsicGas = Transaction.intrinsicGas(
      clauses as Transaction.Clause[],
    );

    // Adding some extra gas to make sure the tx goes through.
    const leeway = executionGas > 0 ? 16000 : 0;

    return intrinsicGas + executionGas + leeway;
  }

  /**
   * Calculate tx fee given gas usage, baseGasPrice and the gasPriceCoefficient.
   * CasPriceCoefficient in {0, 85, 255}.
   * @param {number} gas Gas used to execute the tx.
   * @param {string} baseGasPrice Base gas price fetched from the VeChain Params contract.
   * @param {number} gasPriceCoef Gas price coefficient to determine regular, medium or high gas cost.
   * @return Total transaction gas cost in wei.
   */
  calcTxFee(
    gas: number,
    baseGasPrice: string,
    gasPriceCoef: 0 | 85 | 255,
  ): string {
    return bn(baseGasPrice)
      .times(gasPriceCoef)
      .idiv(255)
      .plus(baseGasPrice)
      .times(gas)
      // .dividedBy(1e18)
      .toString();
  }
}
