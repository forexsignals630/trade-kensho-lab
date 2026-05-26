import { safeDiv, roundTo, clampNumber } from "@/lib/utils";

export interface DrawdownResult {
  drawdownPercent: number;
  recoveryPercent: number;
}

export function calculateDrawdownRecovery(drawdownPercent: number): number {
  const dd = clampNumber(drawdownPercent, 0, 99.9) / 100;
  const recovery = safeDiv(dd, 1 - dd) * 100;
  return roundTo(recovery, 1);
}

export function getDrawdownTable(): DrawdownResult[] {
  const dds = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80];
  return dds.map((dd) => ({
    drawdownPercent: dd,
    recoveryPercent: calculateDrawdownRecovery(dd),
  }));
}
