/**
 * Risk Reward Calculator Tests
 */

import { calculateRiskReward } from "../riskReward";

export function runRiskRewardTests(): void {
  const cases = [
    {
      desc: "Buy: valid RR 1:3",
      input: { entryPrice: 150.0, stopLossPrice: 149.8, takeProfitPrice: 150.6, direction: "buy" as const },
      expected: { rrRatio: 3, breakEvenWinRate: 25, isValid: true },
    },
    {
      desc: "Sell: valid RR 1:2",
      input: { entryPrice: 150.0, stopLossPrice: 150.2, takeProfitPrice: 149.6, direction: "sell" as const },
      expected: { rrRatio: 2, breakEvenWinRate: 33.3, isValid: true },
    },
    {
      desc: "Buy: SL above entry (invalid)",
      input: { entryPrice: 150.0, stopLossPrice: 150.2, takeProfitPrice: 151.0, direction: "buy" as const },
      expected: { isValid: false },
    },
    {
      desc: "Zero risk (SL = entry)",
      input: { entryPrice: 150.0, stopLossPrice: 150.0, takeProfitPrice: 151.0, direction: "buy" as const },
      expected: { isValid: false },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of cases) {
    const result = calculateRiskReward(tc.input);
    if (result.isValid === tc.expected.isValid) {
      if (tc.expected.rrRatio !== undefined) {
        const ok = Math.abs(result.rrRatio - tc.expected.rrRatio) < 0.01;
        if (ok) {
          console.log(`PASS: ${tc.desc}`);
          passed++;
        } else {
          console.error(`FAIL: ${tc.desc} - RR expected ${tc.expected.rrRatio}, got ${result.rrRatio}`);
          failed++;
        }
      } else {
        console.log(`PASS: ${tc.desc}`);
        passed++;
      }
    } else {
      console.error(`FAIL: ${tc.desc} - isValid expected ${tc.expected.isValid}, got ${result.isValid}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

// runRiskRewardTests();
