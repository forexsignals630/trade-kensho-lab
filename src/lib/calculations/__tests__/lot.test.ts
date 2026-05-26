/**
 * Lot Calculator Tests
 * Run with: npx ts-node src/lib/calculations/__tests__/lot.test.ts
 * Or integrate with Jest: npm install --save-dev jest @types/jest ts-jest
 */

import { calculateLot } from "../lot";

interface TestCase {
  description: string;
  input: Parameters<typeof calculateLot>[0];
  expected: Partial<ReturnType<typeof calculateLot>>;
}

const testCases: TestCase[] = [
  {
    description: "Basic: 500k JPY, 2% risk, 20 pips SL, 1000 JPY/pip",
    input: {
      accountBalance: 500000,
      riskPercent: 2,
      stopLossPips: 20,
      pipValue: 1000,
      roundUnit: 0.01,
    },
    expected: {
      allowableLoss: 10000,
      rawLot: 0.5,
      roundedLot: 0.5,
      actualLoss: 10000,
    },
  },
  {
    description: "Zero stop loss should give 0 lot",
    input: {
      accountBalance: 500000,
      riskPercent: 2,
      stopLossPips: 0,
      pipValue: 1000,
      roundUnit: 0.01,
    },
    expected: {
      allowableLoss: 10000,
      rawLot: 0,
      roundedLot: 0,
    },
  },
  {
    description: "Rounding down to 0.1 unit",
    input: {
      accountBalance: 300000,
      riskPercent: 1,
      stopLossPips: 15,
      pipValue: 1000,
      roundUnit: 0.1,
    },
    expected: {
      allowableLoss: 3000,
      roundedLot: 0.2,
    },
  },
];

export function runLotTests(): void {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = calculateLot(tc.input);
    let allMatch = true;

    for (const [key, expectedValue] of Object.entries(tc.expected)) {
      const actualValue = result[key as keyof typeof result];
      if (Math.abs(Number(actualValue) - Number(expectedValue)) > 0.0001) {
        console.error(
          `FAIL: ${tc.description}\n  ${key}: expected ${expectedValue}, got ${actualValue}`
        );
        allMatch = false;
        failed++;
        break;
      }
    }

    if (allMatch) {
      console.log(`PASS: ${tc.description}`);
      passed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

// Uncomment to run directly:
// runLotTests();
