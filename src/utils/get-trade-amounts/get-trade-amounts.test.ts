import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { describe, test, expect } from "vitest";
import { getTradeAmounts } from "./get-trade-amounts";
import type { GetTradeAmountsArgs, TradeAmounts } from "./get-trade-amounts";

type Test = {
  input: GetTradeAmountsArgs;
  output: TradeAmounts;
};

const t1WithdrawAmount: BigNumber = bn(40e18);
const t1TxFee: BigNumber = bn(1e18);
const t1ProtocolFee: BigNumber = t1WithdrawAmount
  .minus(t1TxFee)
  .times(3)
  .div(1000);
const t1DexFee: BigNumber = t1WithdrawAmount
  .minus(t1TxFee)
  .minus(t1ProtocolFee)
  .times(3)
  .div(1000);
const t1TotalFees: BigNumber = t1TxFee.plus(t1ProtocolFee).plus(t1DexFee);

const tests: Test[] = [
  {
    input: {
      reserveBalance: bn(10e18),
      triggerBalance: bn(50e18),
      balance: {
        vet: bn(1000e18),
        vtho: bn(50e18),
      },
      txFee: bn(1e18), // 1 VTHO
      exchangeRate: bn(20),
    },
    output: {
      withdrawAmount: t1WithdrawAmount,
      amountOut: t1WithdrawAmount.minus(t1TotalFees).div(20),
      txFee: t1TxFee,
      protocolFee: t1ProtocolFee,
      dexFee: t1DexFee,
      totalFees: t1TotalFees,
    },
  },
];

describe("getTradeAmounts", () => {
  test("Happy path", () => {
    expect(getTradeAmounts(tests[0].input)).to.deep.equal(tests[0].output);
  });
});
