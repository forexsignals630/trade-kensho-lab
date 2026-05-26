import { safeDiv, roundTo } from "@/lib/utils";

export interface RiskRewardInput {
  entryPrice: number;      // エントリー価格
  takeProfitPrice: number; // 利確価格
  stopLossPrice: number;   // ストップロス価格
  direction: "buy" | "sell"; // 売買方向
  pipSize: number;         // 1pip / 1pointの価格サイズ
  isCfd: boolean;          // CFD銘柄かどうか (単位ラベル切り替え)
}

export interface RiskRewardResult {
  profitPips: number;       // 想定利益幅 (pips or points)
  lossPips: number;         // 想定損失幅 (pips or points)
  rrRatio: number;          // RR比 (profit ÷ loss)
  breakEvenWinRate: number; // 損益分岐勝率 (%)
  unit: string;             // "pips" | "points"
  isValid: boolean;
  errorMessage?: string;
}

export function calculateRiskReward(input: RiskRewardInput): RiskRewardResult {
  const { entryPrice, takeProfitPrice, stopLossPrice, direction, pipSize, isCfd } = input;
  const unit = isCfd ? "points" : "pips";
  const zero: RiskRewardResult = {
    profitPips: 0, lossPips: 0, rrRatio: 0, breakEvenWinRate: 0, unit, isValid: false,
  };

  if (pipSize <= 0) return { ...zero, errorMessage: "pipサイズが不正です" };

  // Direction validation — 価格の向きを確認
  if (direction === "buy") {
    if (stopLossPrice >= entryPrice) {
      return { ...zero, errorMessage: "買いの場合、ストップロス価格はエントリー価格より低くしてください" };
    }
    if (takeProfitPrice <= entryPrice) {
      return { ...zero, errorMessage: "買いの場合、利確価格はエントリー価格より高くしてください" };
    }
  } else {
    if (stopLossPrice <= entryPrice) {
      return { ...zero, errorMessage: "売りの場合、ストップロス価格はエントリー価格より高くしてください" };
    }
    if (takeProfitPrice >= entryPrice) {
      return { ...zero, errorMessage: "売りの場合、利確価格はエントリー価格より低くしてください" };
    }
  }

  // 方向ごとの利益幅・損失幅を価格差から計算
  const profitPriceDiff =
    direction === "buy"
      ? takeProfitPrice - entryPrice
      : entryPrice - takeProfitPrice;
  const lossPriceDiff =
    direction === "buy"
      ? entryPrice - stopLossPrice
      : stopLossPrice - entryPrice;

  if (lossPriceDiff <= 0)   return { ...zero, errorMessage: "損失幅が0以下です。入力値を確認してください" };
  if (profitPriceDiff <= 0) return { ...zero, errorMessage: "利益幅が0以下です。入力値を確認してください" };

  const profitPips       = roundTo(profitPriceDiff / pipSize, 2);
  const lossPips         = roundTo(lossPriceDiff   / pipSize, 2);
  const rrRatio          = roundTo(safeDiv(profitPips, lossPips), 2);
  const breakEvenWinRate = roundTo(safeDiv(1, 1 + rrRatio) * 100, 1);

  return { profitPips, lossPips, rrRatio, breakEvenWinRate, unit, isValid: true };
}
