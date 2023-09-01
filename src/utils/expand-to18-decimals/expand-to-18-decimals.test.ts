import { describe, test, expect } from "vitest";
import { expandTo18Decimals } from "./expand-to-18-decimals";
import * as tests from "./units.json";

describe("expandTo18Decimals", () => {
  for (const tst of tests.tests) {
    const str = <string | null>(<any>tst)["ether_format"];
    if (str == null) {
      continue;
    }

    test(`converts ether_format string to wei: ${tst.name}`, function () {
      const wei = BigInt(tst.wei);
      expect(expandTo18Decimals(str).toFixed()).to.equal(wei.toString(10));
    });
  }
});
