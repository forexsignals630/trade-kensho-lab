import { safeDiv, roundTo, clampNumber } from "@/lib/utils";

export interface LotCalculatorInput {
  accountBalance: number;   // 口座資金
  riskPercent: number;      // 許容リスク率(%)
  stopLossPips: number;     // 損切り幅pips
  pipValue: number;         // 1ロットあたりの1pips価値
  roundUnit: number;        // 丸め後ロットの基準値（例：0.01）
}

export interface LotCalculatorResult {
  allowableLoss: number;    // 許容損失額
  rawLot: number;           // 計算上のロット数
  roundedLot: number;       // 丸め後ロット
  actualLoss: number;       // 想定損失額（丸め後）
}

export function calculateLot(input: LotCalculatorInput): LotCalculatorResult {
  const { accountBalance, riskPercent, stopLossPips, pipValue, roundUnit } = input;

  const allowableLoss = accountBalance * clampNumber(riskPercent, 0, 100) / 100;
  const rawLot = safeDiv(allowableLoss, stopLossPips * pipValue);
  const roundedLot = roundUnit > 0
    ? Math.floor(rawLot / roundUnit) * roundUnit
    : roundTo(rawLot, 2);
  const actualLoss = roundedLot * stopLossPips * pipValue;

  return {
    allowableLoss: roundTo(allowableLoss, 0),
    rawLot: roundTo(rawLot, 4),
    roundedLot: roundTo(roundedLot, 4),
    actualLoss: roundTo(actualLoss, 0),
  };
}
