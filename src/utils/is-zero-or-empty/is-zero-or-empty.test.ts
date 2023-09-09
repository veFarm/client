import { describe, test, expect } from "vitest";
import { isZeroOrEmpty } from "./is-zero-or-empty";

describe("isZeroOrEmpty", () => {
  test("Empty strings should return true", () => {
    expect(isZeroOrEmpty("")).to.equal(true);
    expect(isZeroOrEmpty(" ")).to.equal(true);
  });
  test("Zero(s) string should return true", () => {
    expect(isZeroOrEmpty("0")).to.equal(true);
    expect(isZeroOrEmpty("000")).to.equal(true);
  });
  test("Not zero or empty strings should return false", () => {
    expect(isZeroOrEmpty("foo")).to.equal(false);
  });
});
