import { roundTo } from "@/lib/utils";

export interface PipsProfitInput {
  pips: number;       // pips数
  lots: number;       // ロット数
  pipValue: number;   // 1ロットあたりの1pips価値
}

export interface PipsProfitResult {
  profit: number;
}

export function calculatePipsProfit(input: PipsProfitInput): PipsProfitResult {
  const profit = input.pips * input.lots * input.pipValue;
  return { profit: roundTo(profit, 0) };
}

export function getPipsProfitTable(lots: number, pipValue: number): Array<{ pips: number; profit: number }> {
  const pipsList = [1, 5, 10, 20, 30, 50, 100, 200];
  return pipsList.map((pips) => ({
    pips,
    profit: roundTo(pips * lots * pipValue, 0),
  }));
}
