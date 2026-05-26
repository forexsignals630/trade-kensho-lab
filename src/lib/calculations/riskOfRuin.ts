import { clampNumber } from "@/lib/utils";

export interface RiskOfRuinInput {
  winRate: number;         // 勝率(%)
  rrRatio: number;         // RR比
  riskPerTradePercent: number; // 1回リスク率(%)
  initialCapital: number;  // 初期資金
  numTrades: number;       // 試行回数
}

export interface SimulationResult {
  equityCurve: number[];   // 資産推移
  finalCapital: number;
  maxDrawdown: number;     // 最大ドローダウン(%)
  ruined: boolean;         // 資産50%以下になったか（破産判定）
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

export function runRiskOfRuinSimulation(input: RiskOfRuinInput, seed = 42): SimulationResult {
  const { winRate, rrRatio, riskPerTradePercent, initialCapital, numTrades } = input;

  const winProb = clampNumber(winRate, 0, 100) / 100;
  const riskFrac = clampNumber(riskPerTradePercent, 0.01, 100) / 100;
  const rr = Math.max(0.01, rrRatio);

  const rand = seededRandom(seed);

  let capital = initialCapital;
  let peak = capital;
  let maxDD = 0;
  const equityCurve: number[] = [capital];

  for (let i = 0; i < numTrades; i++) {
    const riskAmount = capital * riskFrac;
    if (rand() < winProb) {
      capital += riskAmount * rr;
    } else {
      capital -= riskAmount;
    }
    capital = Math.max(0, capital);
    equityCurve.push(Math.round(capital));

    if (capital > peak) peak = capital;
    const dd = peak > 0 ? (peak - capital) / peak * 100 : 0;
    if (dd > maxDD) maxDD = dd;

    if (capital <= 0) break;
  }

  return {
    equityCurve,
    finalCapital: Math.round(capital),
    maxDrawdown: Math.round(maxDD * 10) / 10,
    ruined: capital < initialCapital * 0.5,
  };
}

export function runMultipleSimulations(
  input: RiskOfRuinInput,
  runs = 20
): SimulationResult[] {
  return Array.from({ length: runs }, (_, i) =>
    runRiskOfRuinSimulation(input, i * 997 + 42)
  );
}
