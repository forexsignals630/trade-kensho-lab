import { roundTo, clampNumber } from "@/lib/utils";

export type ConfidenceLevel = 90 | 95 | 99;

const Z_SCORES: Record<ConfidenceLevel, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

export interface BacktestSampleInput {
  expectedWinRate: number;     // 想定勝率(%)
  marginOfError: number;       // 許容誤差(%)
  confidenceLevel: ConfidenceLevel; // 信頼水準
}

export interface BacktestSampleResult {
  sampleSize: number;
  z: number;
  p: number;
  e: number;
}

export function calculateBacktestSampleSize(input: BacktestSampleInput): BacktestSampleResult {
  const p = clampNumber(input.expectedWinRate, 1, 99) / 100;
  const e = clampNumber(input.marginOfError, 0.1, 50) / 100;
  const z = Z_SCORES[input.confidenceLevel];

  const n = Math.ceil((z * z * p * (1 - p)) / (e * e));

  return {
    sampleSize: n,
    z,
    p: roundTo(p * 100, 1),
    e: roundTo(e * 100, 1),
  };
}
