/**
 * Expectancy Calculator Tests
 */

import { calculateExpectancy } from "../expectancy";

export function runExpectancyTests(): void {
  const cases = [
    {
      desc: "50% win rate, 2000 avg profit, 1000 avg loss => +500 expectancy",
      input: { winRate: 50, avgProfit: 2000, avgLoss: 1000 },
      expected: { expectancy: 500, isPositive: true, rrRatio: 2 },
    },
    {
      desc: "40% win rate, RR 2.0 => positive expectancy",
      input: { winRate: 40, avgProfit: 2000, avgLoss: 1000 },
      expected: { isPositive: true },
    },
    {
      desc: "30% win rate, RR 1.0 => negative expectancy",
      input: { winRate: 30, avgProfit: 1000, avgLoss: 1000 },
      expected: { isPositive: false },
    },
    {
      desc: "100% win rate => always positive",
      input: { winRate: 100, avgProfit: 100, avgLoss: 1000 },
      expected: { isPositive: true, expectancy: 100 },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of cases) {
    const result = calculateExpectancy(tc.input);
    let ok = result.isPositive === tc.expected.isPositive;

    if (ok && tc.expected.expectancy !== undefined) {
      ok = Math.abs(result.expectancy - tc.expected.expectancy) < 0.1;
    }

    if (ok) {
      console.log(`PASS: ${tc.desc}`);
      passed++;
    } else {
      console.error(`FAIL: ${tc.desc}`, { result, expected: tc.expected });
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

// runExpectancyTests();
