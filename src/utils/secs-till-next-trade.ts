import bn from "bignumber.js";
import { parseUnits } from "@/utils/parse-units";

// TODO: see https://vechainstats.com/vtho-calculator/
export function secsTillNextTrade(
  triggerBalance: string,
  balance: {
    /** Decimals */
    vet: string;
    /** Decimals */
    vtho: string;
  },
): number | undefined {
  if (triggerBalance.trim() === "" || parseInt(triggerBalance, 10) === 0)
    return;

  const vetBalanceWei = bn(parseUnits(balance.vet));
  const vthoBalanceWei = bn(parseUnits(balance.vtho));
  const triggerBalanceWei = bn(parseUnits(triggerBalance));

  const diff = triggerBalanceWei.minus(vthoBalanceWei);

  // If balance >= triggerBalance
  if (diff.lte(0)) return 5 * 60; // 5 mins

  // If balance < triggerBalance and vetBalance > 0
  if (vetBalanceWei.gt(0)) {
    // 1 VET produces 5e-8 VTHO per block
    // TODO: check this --> https://docs.vechain.org/openzeppelin-compatibility/vechain-modifications#two-token-design
    const vthoPerBlock = vetBalanceWei.times(bn(5e-8)); // not zero
    // Number of blocks till reaching the trigger balance
    const blocksTillTrigger = diff.div(vthoPerBlock);
    // 1 block minted every 10 secs
    return blocksTillTrigger.times(10).toNumber(); // TODO: can it overflow?
  }
}
