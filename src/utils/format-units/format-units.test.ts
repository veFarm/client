import { describe, test, expect } from "vitest";
import bn from "bignumber.js";
import { formatUnits } from "./format-units";
import * as tests from "../test-cases/units.json";

describe("formatUnits", () => {
  for (const tst of tests.tests) {
    const str = <string | null>(<any>tst)["ether_format"];

    if (str == null) continue;

    test(`converts wei string to ether_format: ${tst.name}`, function () {
      const wei = bn(tst.wei);
      expect(formatUnits(wei)).to.equal(tst.ether_format);
    });
  }
});
