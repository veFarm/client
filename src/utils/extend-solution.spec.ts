import bn from "bignumber.js";
import { makeFakeSolutions } from "../__tests__/fixtures/solver";
import { expandTo18Decimals } from "./expand-to-18-decimals";
import { extendSolution, MAX_WITHDRAW_AMOUNT } from "./extend-solution";

describe("extendSolution utils", () => {
  it("max out the withdraw amount when vtho balance is higher than the withdraw amount provided by the solution", async () => {
    // Arrange
    expect.assertions(1);
    const reserves = {
      reserveVtho: expandTo18Decimals(1_000_000),
      reserveVet: expandTo18Decimals(100_000),
    };
    const solutions = makeFakeSolutions();
    const sol = solutions[solutions.length - 1]; // get the best solution
    const reserveBalance = expandTo18Decimals(10);
    const txFee = expandTo18Decimals(3);
    const vthoBalance = bn(2).times(sol.withdrawAmount).plus(reserveBalance);

    // Act
    const extSol = extendSolution(
      sol,
      vthoBalance,
      reserveBalance,
      txFee,
      reserves.reserveVtho,
      reserves.reserveVet,
    );

    // Assert
    expect(extSol.withdrawAmount).toEqual(vthoBalance.minus(reserveBalance));
  });

  it("returns the original solution when vtho balance is lower than the withdraw amount", async () => {
    // Arrange
    expect.assertions(1);
    const reserves = {
      reserveVtho: expandTo18Decimals(1_000_000),
      reserveVet: expandTo18Decimals(100_000),
    };
    const solutions = makeFakeSolutions();
    const sol = solutions[solutions.length - 1]; // get the best solution
    const reserveBalance = expandTo18Decimals(10);
    const txFee = expandTo18Decimals(3);
    const vthoBalance = sol.withdrawAmount.plus(reserveBalance).minus(bn(1));

    // Act
    const extSol = extendSolution(
      sol,
      vthoBalance,
      reserveBalance,
      txFee,
      reserves.reserveVtho,
      reserves.reserveVet,
    );

    // Assert
    expect(extSol.withdrawAmount).toEqual(sol.withdrawAmount);
  });

  it("returns the original solution when vtho balance equals the withdraw amount", async () => {
    // Arrange
    expect.assertions(1);
    const reserves = {
      reserveVtho: expandTo18Decimals(1_000_000),
      reserveVet: expandTo18Decimals(100_000),
    };
    const solutions = makeFakeSolutions();
    const sol = solutions[solutions.length - 1]; // get the best solution
    const reserveBalance = expandTo18Decimals(10);
    const txFee = expandTo18Decimals(3);
    const vthoBalance = sol.withdrawAmount.plus(reserveBalance);

    // Act
    const extSol = extendSolution(
      sol,
      vthoBalance,
      reserveBalance,
      txFee,
      reserves.reserveVtho,
      reserves.reserveVet,
    );

    // Assert
    expect(extSol.withdrawAmount).toEqual(sol.withdrawAmount);
  });

  it("never surpasses the max withdraw amount", async () => {
    // Arrange
    expect.assertions(1);
    const reserves = {
      reserveVtho: expandTo18Decimals(1_000_000),
      reserveVet: expandTo18Decimals(100_000),
    };
    const solutions = makeFakeSolutions();
    const sol = solutions[solutions.length - 1]; // get the best solution
    const reserveBalance = expandTo18Decimals(10);
    const txFee = expandTo18Decimals(3);
    const vthoBalance = sol.withdrawAmount
      .plus(reserveBalance)
      .plus(expandTo18Decimals(MAX_WITHDRAW_AMOUNT));

    // Act
    const extSol = extendSolution(
      sol,
      vthoBalance,
      reserveBalance,
      txFee,
      reserves.reserveVtho,
      reserves.reserveVet,
    );

    // Assert
    expect(extSol.withdrawAmount).toEqual(
      expandTo18Decimals(MAX_WITHDRAW_AMOUNT),
    );
  });
});
