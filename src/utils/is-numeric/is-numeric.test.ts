import { describe, test, expect } from "vitest";
import { isNumeric } from "./is-numeric";

const stringNumbers: string[] = [];

for (let i = 0; i < 10; i++) {
  stringNumbers.push(i.toString());
}
// stringNumbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const allChars: string[] = [];

for (let i = 32; i < 127; i++) {
  allChars.push(String.fromCharCode(i));
}
// allChars: [" ", "!", """, "#", "$", "%", "&", "'", "(", ")", "*",
// "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7",
// "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D",
// "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q",
// "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\", "]", "^",
//"_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
//"l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
// "y", "z", "{", "|", "}", "~"]

describe("isNumeric", () => {
  test("string of numbers should return true", () => {
    expect(isNumeric("12312312")).toBe(true);
  });
  test("string of zeros should return true", () => {
    expect(isNumeric("0000")).toBe(true);
  });
  test("empty string should return false", () => {
    expect(isNumeric("")).toBe(false);
  });
  allChars
    .filter((char) => !stringNumbers.includes(char))
    .forEach((char) => {
      test(`string containing the ${char} character should return false`, () => {
        expect(isNumeric(char)).toBe(false);
      });
    });
});
