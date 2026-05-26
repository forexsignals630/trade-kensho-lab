import { roundTo } from "@/lib/utils";

export interface SpreadCostInput {
  spreadPips: number;        // スプレッドpips
  lots: number;              // ロット数
  pipValue: number;          // 1pips価値
  commissionPerSide: number; // 片道手数料
  tradesPerMonth: number;    // 月間取引回数
}

export interface SpreadCostResult {
  spreadCostPerTrade: number;     // スプレッドコスト（1回）
  commissionRoundTrip: number;    // 往復手数料
  totalCostPerTrade: number;      // 合計コスト（1回）
  monthlyCost: number;            // 月間コスト
  annualCost: number;             // 年間コスト
}

export function calculateSpreadCost(input: SpreadCostInput): SpreadCostResult {
  const { spreadPips, lots, pipValue, commissionPerSide, tradesPerMonth } = input;

  const spreadCostPerTrade = spreadPips * lots * pipValue;
  const commissionRoundTrip = commissionPerSide * 2;
  const totalCostPerTrade = spreadCostPerTrade + commissionRoundTrip;
  const monthlyCost = totalCostPerTrade * tradesPerMonth;
  const annualCost = monthlyCost * 12;

  return {
    spreadCostPerTrade: roundTo(spreadCostPerTrade, 0),
    commissionRoundTrip: roundTo(commissionRoundTrip, 0),
    totalCostPerTrade: roundTo(totalCostPerTrade, 0),
    monthlyCost: roundTo(monthlyCost, 0),
    annualCost: roundTo(annualCost, 0),
  };
}
