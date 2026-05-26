// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountCurrency = "JPY" | "USD";
export type InputMethod    = "direct" | "prices";
export type TradeDirection = "買い" | "売り";
export type ProfitDirection = "profit" | "loss" | "even";

export interface PairData {
  pipSize:        number;
  isCfd:          boolean;
  profitCurrency: string;
  unit:           "pips" | "points";
}

// ─── Pair database ────────────────────────────────────────────────────────────

export const PAIR_DATA: Record<string, PairData> = {
  // JPY-quote FX
  USDJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  EURJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  GBPJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  AUDJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  CHFJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  NZDJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  CADJPY: { pipSize: 0.01,   isCfd: false, profitCurrency: "JPY", unit: "pips" },
  // USD-quote FX
  EURUSD: { pipSize: 0.0001, isCfd: false, profitCurrency: "USD", unit: "pips" },
  GBPUSD: { pipSize: 0.0001, isCfd: false, profitCurrency: "USD", unit: "pips" },
  AUDUSD: { pipSize: 0.0001, isCfd: false, profitCurrency: "USD", unit: "pips" },
  NZDUSD: { pipSize: 0.0001, isCfd: false, profitCurrency: "USD", unit: "pips" },
  // Other-quote FX
  USDCAD: { pipSize: 0.0001, isCfd: false, profitCurrency: "CAD", unit: "pips" },
  USDCHF: { pipSize: 0.0001, isCfd: false, profitCurrency: "CHF", unit: "pips" },
  EURGBP: { pipSize: 0.0001, isCfd: false, profitCurrency: "GBP", unit: "pips" },
  EURAUD: { pipSize: 0.0001, isCfd: false, profitCurrency: "AUD", unit: "pips" },
  EURCAD: { pipSize: 0.0001, isCfd: false, profitCurrency: "CAD", unit: "pips" },
  EURCHF: { pipSize: 0.0001, isCfd: false, profitCurrency: "CHF", unit: "pips" },
  EURNZD: { pipSize: 0.0001, isCfd: false, profitCurrency: "NZD", unit: "pips" },
  GBPAUD: { pipSize: 0.0001, isCfd: false, profitCurrency: "AUD", unit: "pips" },
  GBPCAD: { pipSize: 0.0001, isCfd: false, profitCurrency: "CAD", unit: "pips" },
  GBPCHF: { pipSize: 0.0001, isCfd: false, profitCurrency: "CHF", unit: "pips" },
  GBPNZD: { pipSize: 0.0001, isCfd: false, profitCurrency: "NZD", unit: "pips" },
  AUDCAD: { pipSize: 0.0001, isCfd: false, profitCurrency: "CAD", unit: "pips" },
  AUDCHF: { pipSize: 0.0001, isCfd: false, profitCurrency: "CHF", unit: "pips" },
  AUDNZD: { pipSize: 0.0001, isCfd: false, profitCurrency: "NZD", unit: "pips" },
  CADCHF: { pipSize: 0.0001, isCfd: false, profitCurrency: "CHF", unit: "pips" },
  NZDCAD: { pipSize: 0.0001, isCfd: false, profitCurrency: "CAD", unit: "pips" },
  NZDCHF: { pipSize: 0.0001, isCfd: false, profitCurrency: "CHF", unit: "pips" },
  // CFD
  XAUUSD: { pipSize: 0.01, isCfd: true, profitCurrency: "USD", unit: "points" },
  BTCUSD: { pipSize: 1,    isCfd: true, profitCurrency: "USD", unit: "points" },
  JP225:  { pipSize: 1,    isCfd: true, profitCurrency: "JPY", unit: "points" },
  US100:  { pipSize: 1,    isCfd: true, profitCurrency: "USD", unit: "points" },
  US500:  { pipSize: 1,    isCfd: true, profitCurrency: "USD", unit: "points" },
};

// ─── Conversion helpers ───────────────────────────────────────────────────────

// Currency rank — lower = more major (used to build "natural" rate pair label)
const CURRENCY_RANK: Record<string, number> = {
  EUR: 0, GBP: 1, AUD: 2, NZD: 3, USD: 4, CAD: 5, CHF: 6, JPY: 7,
};

export interface ConversionInfo {
  isNeeded:  boolean;
  label:     string;            // e.g. "USDJPY換算レート"
  direction: "multiply" | "divide"; // accountAmount = profitAmount * rate  OR  / rate
}

export function getConversionInfo(
  profitCurrency: string,
  accountCurrency: string
): ConversionInfo {
  if (profitCurrency === accountCurrency) {
    return { isNeeded: false, label: "", direction: "multiply" };
  }

  const pr = CURRENCY_RANK[profitCurrency]  ?? 99;
  const ar = CURRENCY_RANK[accountCurrency] ?? 99;

  if (pr <= ar) {
    // profitCurrency is the more "major" — natural rate is profit/account, multiply
    return {
      isNeeded: true,
      label: `${profitCurrency}${accountCurrency}換算レート`,
      direction: "multiply",
    };
  } else {
    // accountCurrency is more major — natural rate is account/profit, divide
    return {
      isNeeded: true,
      label: `${accountCurrency}${profitCurrency}換算レート`,
      direction: "divide",
    };
  }
}

export function applyConversion(
  amount: number,
  info: ConversionInfo,
  rate: number
): number {
  if (!info.isNeeded) return amount;
  return info.direction === "multiply" ? amount * rate : amount / rate;
}

// ─── Calculation ──────────────────────────────────────────────────────────────

export interface ProfitLossInput {
  pair:           string;
  inputMethod:    InputMethod;
  // — direct input fields —
  pipsInput?:     number;
  profitDirection?: "profit" | "loss";
  // — price input fields —
  entryPrice?:    number;
  exitPrice?:     number;
  tradeDirection?: TradeDirection;
  // — common —
  lots:           number;
  lotUnits:       number;        // FX: 100_000 / 10_000 / 1_000
  cfdPointValue:  number;        // CFD: user-defined per-lot-per-point value
  accountCurrency: AccountCurrency;
  conversionRate?: number;
}

export interface ProfitLossResult {
  isValid:           boolean;
  errorMessage?:     string;
  // —
  pips:              number;
  unit:              "pips" | "points";
  profitPerUnit:     number;   // per pip/point in account currency
  totalProfit:       number;   // absolute value in account currency
  totalProfitSigned: number;   // signed (+profit / -loss / 0)
  profitDirection:   ProfitDirection;
  accountCurrency:   AccountCurrency;
  profitCurrency:    string;
  isCfd:             boolean;
  conversionNeeded:  boolean;
  conversionLabel:   string;
  conversionRate?:   number;
}

const EMPTY_RESULT: Omit<ProfitLossResult, "isValid" | "errorMessage" | "accountCurrency"> = {
  pips: 0, unit: "pips", profitPerUnit: 0,
  totalProfit: 0, totalProfitSigned: 0,
  profitDirection: "even", profitCurrency: "",
  isCfd: false, conversionNeeded: false, conversionLabel: "",
};

export function calculateProfitLoss(input: ProfitLossInput): ProfitLossResult {
  const pd = PAIR_DATA[input.pair];
  const base = { ...EMPTY_RESULT, accountCurrency: input.accountCurrency };

  if (!pd) return { ...base, isValid: false, errorMessage: "通貨ペア・銘柄が見つかりません" };

  const { pipSize, isCfd, profitCurrency, unit } = pd;

  // ── Determine pips/points and direction ──────────────────────────────────
  let pips: number;
  let profitDir: ProfitDirection;

  if (input.inputMethod === "prices") {
    const ep = input.entryPrice ?? 0;
    const xp = input.exitPrice  ?? 0;
    if (ep <= 0 || xp <= 0) {
      return { ...base, isValid: false, errorMessage: "価格は0より大きい数値で入力してください" };
    }
    const diff = xp - ep;
    pips = Math.abs(diff) / pipSize;
    if (pips < 0.005) {
      profitDir = "even";
    } else if (input.tradeDirection === "買い") {
      profitDir = diff > 0 ? "profit" : "loss";
    } else {
      profitDir = diff < 0 ? "profit" : "loss";
    }
  } else {
    const p = input.pipsInput ?? 0;
    if (isNaN(p) || p < 0) {
      return { ...base, isValid: false, errorMessage: "値幅を0以上の数値で入力してください" };
    }
    pips     = p;
    profitDir = p < 0.005 ? "even" : (input.profitDirection ?? "profit");
  }

  // ── Per-unit profit in profit currency ───────────────────────────────────
  let perUnitInProfitCcy: number;
  if (isCfd) {
    if (input.cfdPointValue < 0) {
      return { ...base, isValid: false, errorMessage: "1lotあたり1pointの損益を入力してください" };
    }
    perUnitInProfitCcy = input.cfdPointValue * input.lots;
  } else {
    if (input.lotUnits <= 0) {
      return { ...base, isValid: false, errorMessage: "1lotあたりの通貨量を確認してください" };
    }
    perUnitInProfitCcy = input.lotUnits * pipSize * input.lots;
  }

  const totalInProfitCcy = pips * perUnitInProfitCcy;

  // ── Currency conversion ───────────────────────────────────────────────────
  const conv = getConversionInfo(profitCurrency, input.accountCurrency);
  let perUnit: number;
  let total:   number;

  if (conv.isNeeded) {
    const rate = input.conversionRate ?? 0;
    if (rate <= 0) {
      return { ...base, isValid: false, errorMessage: "換算レートを入力してください" };
    }
    perUnit = applyConversion(perUnitInProfitCcy, conv, rate);
    total   = applyConversion(totalInProfitCcy,   conv, rate);
  } else {
    perUnit = perUnitInProfitCcy;
    total   = totalInProfitCcy;
  }

  const sign = profitDir === "loss" ? -1 : profitDir === "even" ? 0 : 1;

  return {
    isValid:           true,
    pips,
    unit,
    profitPerUnit:     perUnit,
    totalProfit:       total,
    totalProfitSigned: total * sign,
    profitDirection:   profitDir,
    accountCurrency:   input.accountCurrency,
    profitCurrency,
    isCfd,
    conversionNeeded:  conv.isNeeded,
    conversionLabel:   conv.label,
    conversionRate:    input.conversionRate,
  };
}
