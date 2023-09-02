import { describe, test, expect } from "vitest";
import { truncateDecimalString } from "./truncate-decimal-string";

describe("truncateDecimalString", () => {
  test("empty string", () => {
    expect(truncateDecimalString("", 2)).to.equal(".00");
    expect(truncateDecimalString("", 1)).to.equal(".0");
  });
  test("integer string representation", () => {
    expect(truncateDecimalString("1", 2)).to.equal("1.00");
    expect(truncateDecimalString("123", 1)).to.equal("123.0");
  });
  test("float string representation", () => {
    expect(truncateDecimalString("1.234", 2)).to.equal("1.23");
    expect(truncateDecimalString('123.456', 1)).to.equal('123.4')
    expect(truncateDecimalString('123.456', 5)).to.equal('123.45600')
    expect(truncateDecimalString('-123.456', 1)).to.equal('-123.4')
    expect(truncateDecimalString('0.1', 3)).to.equal('0.100')
    expect(truncateDecimalString('1', 0)).to.equal('1')
  });
});
