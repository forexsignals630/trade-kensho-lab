import { safeDiv, roundTo, clampNumber } from "@/lib/utils";

export type InputMode = "amount" | "r" | "pips";

export interface ExpectancyInput {
  winRate: number;        // 勝率(%) 0〜100
  avgProfit: number;      // 平均利益 (正の数)
  avgLoss: number;        // 平均損失 (正の数)
  tradeCount?: number;    // 想定取引回数（任意）
}

export type Verdict = "positive" | "zero" | "negative";

export interface ExpectancyResult {
  winRatePercent: number;         // 勝率(%)
  lossRatePercent: number;        // 敗率(%)
  rrRatio: number;                // 平均RR比
  expectancy: number;             // 1回あたりの期待値
  expectancyTotal: number | null; // 期待値合計 (tradeCount指定時)
  verdict: Verdict;               // "positive" | "zero" | "negative"
  isValid: boolean;
  errorMessage?: string;
}

export function calculateExpectancy(input: ExpectancyInput): ExpectancyResult {
  const invalid = (errorMessage: string): ExpectancyResult => ({
    winRatePercent: 0, lossRatePercent: 0, rrRatio: 0,
    expectancy: 0, expectancyTotal: null,
    verdict: "negative", isValid: false, errorMessage,
  });

  const { winRate, avgProfit, avgLoss, tradeCount } = input;

  if (winRate < 0 || winRate > 100) {
    return invalid("勝率は0〜100%の範囲で入力してください");
  }
  if (avgProfit < 0) {
    return invalid("平均利益は0以上の値を入力してください");
  }
  if (avgLoss < 0) {
    return invalid("平均損失はマイナスではなく、正の数で入力してください");
  }
  if (avgProfit === 0 && avgLoss === 0) {
    return invalid("平均利益と平均損失を入力してください");
  }

  const winRateDecimal  = clampNumber(winRate, 0, 100) / 100;
  const lossRateDecimal = 1 - winRateDecimal;

  const profit = Math.abs(avgProfit);
  const loss   = Math.abs(avgLoss);

  const rrRatio    = safeDiv(profit, loss);
  const expectancy = winRateDecimal * profit - lossRateDecimal * loss;

  const total =
    tradeCount !== undefined && tradeCount > 0
      ? roundTo(expectancy * tradeCount, 2)
      : null;

  // ほぼゼロ判定: 絶対値が最大入力値の0.1%未満
  const absMax    = Math.max(profit, loss);
  const isNearZero = absMax > 0 && Math.abs(expectancy) / absMax < 0.001;
  const verdict: Verdict =
    isNearZero ? "zero" : expectancy > 0 ? "positive" : "negative";

  return {
    winRatePercent:  roundTo(winRate, 1),
    lossRatePercent: roundTo(lossRateDecimal * 100, 1),
    rrRatio:         roundTo(rrRatio, 2),
    expectancy:      roundTo(expectancy, 2),
    expectancyTotal: total,
    verdict,
    isValid: true,
  };
}
