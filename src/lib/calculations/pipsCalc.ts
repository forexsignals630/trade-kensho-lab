import { roundTo } from "@/lib/utils";

export type CalcType  = "exit" | "sl" | "tp";
export type Direction = "buy" | "sell";

export interface PipsCalcInput {
  entryPrice:   number;
  comparePrice: number;
  pipSize:      number;
  isCfd:        boolean;
  direction:    Direction;
}

export type PipsDirection = "profit" | "loss" | "even";

export interface PipsCalcResult {
  pips:           number;         // 値幅 (pips / points)
  unit:           string;         // "pips" | "points"
  pipDirection:   PipsDirection;  // "profit" | "loss" | "even"
  directionLabel: string;         // "利益方向" | "損失方向" | "同値"
  pipSizeLabel:   string;         // "1pips = 0.01" 等
  isValid:        boolean;
  errorMessage?:  string;
}

export function calculatePips(input: PipsCalcInput): PipsCalcResult {
  const { entryPrice, comparePrice, pipSize, isCfd, direction } = input;
  const unit         = isCfd ? "points" : "pips";
  const unitSingular = isCfd ? "point"  : "pip";
  const pipSizeLabel = `1${unitSingular} = ${pipSize}`;

  const invalid = (errorMessage: string): PipsCalcResult => ({
    pips: 0, unit, pipDirection: "even", directionLabel: "同値",
    pipSizeLabel, isValid: false, errorMessage,
  });

  if (pipSize <= 0) return invalid("pipサイズが不正です");
  if (entryPrice <= 0)   return invalid("エントリー価格を入力してください");
  if (comparePrice <= 0) return invalid("比較価格を入力してください");

  const diff = comparePrice - entryPrice;
  const pips = roundTo(Math.abs(diff) / pipSize, 2);

  // 同値判定: pips < 0.005 (丸め誤差考慮)
  if (pips < 0.005) {
    return { pips: 0, unit, pipDirection: "even", directionLabel: "同値", pipSizeLabel, isValid: true };
  }

  // 損益方向判定
  let pipDirection: PipsDirection;
  if (direction === "buy") {
    pipDirection = diff > 0 ? "profit" : "loss";
  } else {
    pipDirection = diff < 0 ? "profit" : "loss";
  }

  const directionLabel = pipDirection === "profit" ? "利益方向" : "損失方向";

  return { pips, unit, pipDirection, directionLabel, pipSizeLabel, isValid: true };
}
