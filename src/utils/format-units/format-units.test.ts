import { describe, test, expect } from "vitest";
import bn from "bignumber.js";
import { formatUnits } from "./format-units";

type Test = {
  name: string;
  wei: string;
  ether: string;
  decimals?: number;
};

const tests: Test[] = [
  {
    name: "one-bare",
    wei: "1000000000000000000",
    ether: "1",
    decimals: 0,
  },
  {
    name: "one-two-decimals",
    wei: "1000000000000000000",
    ether: "1.00",
    decimals: 2,
  },
  {
    name: "negative-one-one-decimal",
    wei: "-1000000000000000000",
    ether: "-1.0",
    decimals: 1,
  },
  {
    name: "tenth-proper",
    wei: "100000000000000000",
    ether: "0.1",
    decimals: 1,
  },
  {
    name: "tenth-two-decimals",
    wei: "100000000000000000",
    ether: "0.10",
    decimals: 2,
  },
  {
    name: "tenth-three-decimals",
    wei: "100000000000000000",
    ether: "0.100",
    decimals: 3,
  },
  {
    name: "negative-tenth-proper",
    wei: "-100000000000000000",
    ether: "-0.1",
    decimals: 1,
  },
  {
    name: "hundredth-proper",
    wei: "10000000000000000",
    ether: "0.01",
    decimals: 2,
  },
  {
    name: "amount-fraction",
    wei: "1230000000000000000",
    ether: "1.23",
    decimals: 2,
  },
  {
    name: "amount-negative-fraction-three-decimals",
    wei: "-1230000000000000000",
    ether: "-1.230",
    decimals: 3,
  },
  {
    name: "pad-negative-fraction-expanded",
    wei: "-1230000000000000000",
    ether: "-1.23",
  },
  {
    name: "one-two-three-two-decimals",
    wei: "1234567890000000000000000",
    ether: "1234567.89",
    decimals: 2,
  },
  {
    name: "one-two-three-three-decimals",
    wei: "1234567890123456789012345",
    ether: "1234567.890",
    decimals: 3,
  },
  {
    name: "one-two-three-expanded",
    wei: "1234567890000000000000000",
    ether: "1234567.89",
  },
  {
    name: "one-two-three-2-expanded",
    wei: "-1234567890123456789012345",
    ether: "-1234567.890123456789012345",
  },
];

describe("formatUnits", () => {
  for (const tst of tests) {
    const str = <string | null>(<any>tst)["wei"];

    if (str == null) continue;

    test(`converts wei string to ether representation: ${tst.name}`, function () {
      const wei = bn(tst.wei);
      expect(formatUnits(wei, tst.decimals)).to.equal(tst.ether);
    });
  }
});
