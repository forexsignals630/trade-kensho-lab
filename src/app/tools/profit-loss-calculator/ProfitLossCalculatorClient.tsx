"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  Activity,
  Scale,
  BarChart3,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import AffiliateSection from "@/components/AffiliateSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { TOOL_AFFILIATE_MAP } from "@/data/affiliateItems";
import {
  calculateProfitLoss,
  getConversionInfo,
  PAIR_DATA,
  type AccountCurrency,
  type InputMethod,
  type TradeDirection,
  type ProfitLossResult,
} from "@/lib/calculations/profitLoss";
import { trackToolCalculate, trackRelatedToolClick, trackAffiliateClick } from "@/lib/analytics";
import type { ArticleMeta } from "@/types/article";

// ─── Pair groups ──────────────────────────────────────────────────────────────

const PAIR_GROUPS = [
  { label: "メジャーFX",  pairs: ["EURUSD","GBPUSD","USDJPY","USDCHF","USDCAD","AUDUSD","NZDUSD"] },
  { label: "クロス円",    pairs: ["GBPJPY","AUDJPY","CHFJPY","EURJPY","NZDJPY","CADJPY"] },
  { label: "クロス通貨",  pairs: ["AUDCAD","AUDCHF","AUDNZD","CADCHF","EURAUD","EURCAD","EURCHF","EURGBP","EURNZD","GBPAUD","GBPCAD","GBPCHF","GBPNZD","NZDCAD","NZDCHF"] },
  { label: "CFD・その他", pairs: ["XAUUSD","BTCUSD","JP225","US100","US500"] },
];

const LOT_UNIT_OPTIONS = [
  { label: "スタンダード：1lot = 100,000通貨", value: 100000 },
  { label: "ミニ：1lot = 10,000通貨",           value: 10000  },
  { label: "マイクロ：1lot = 1,000通貨",         value: 1000   },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  accountCurrency: AccountCurrency;
  pair:            string;
  inputMethod:     InputMethod;
  // direct
  pipsInput:       string;
  profitDirection: "profit" | "loss";
  // prices
  tradeDirection:  TradeDirection;
  entryPrice:      string;
  exitPrice:       string;
  // common
  lots:            string;
  lotUnits:        number;
  cfdPointValue:   string;
  conversionRate:  string;
}

const DEFAULT_FORM: FormState = {
  accountCurrency: "JPY",
  pair:            "USDJPY",
  inputMethod:     "direct",
  pipsInput:       "25",
  profitDirection: "profit",
  tradeDirection:  "買い",
  entryPrice:      "150.000",
  exitPrice:       "150.250",
  lots:            "0.40",
  lotUnits:        100000,
  cfdPointValue:   "1",
  conversionRate:  "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: AccountCurrency): string {
  if (currency === "JPY") {
    return (
      amount.toLocaleString("ja-JP", { maximumFractionDigits: 0 }) + "円"
    );
  }
  return (
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " USD"
  );
}

function formatPips(pips: number, unit: "pips" | "points"): string {
  return pips.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + unit;
}

function formatPerUnit(amount: number, currency: AccountCurrency, unit: "pips" | "points"): string {
  const unitLabel = unit === "pips" ? "pips" : "point";
  if (currency === "JPY") {
    return amount.toLocaleString("ja-JP", { maximumFractionDigits: 2 }) + "円 / " + unitLabel;
  }
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + " USD / " + unitLabel;
}

// ─── Result styles ────────────────────────────────────────────────────────────

function getDirectionStyle(dir: ProfitLossResult["profitDirection"]) {
  switch (dir) {
    case "profit": return { bg: "bg-brand-50", text: "text-brand-600", label: "利益", icon: <TrendingUp className="w-5 h-5" /> };
    case "loss":   return { bg: "bg-red-50",   text: "text-red-600",   label: "損失", icon: <TrendingDown className="w-5 h-5" /> };
    default:       return { bg: "bg-slate-50", text: "text-slate-500", label: "同値", icon: <Minus className="w-5 h-5" /> };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="block h-px flex-1 bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
        {children}
      </span>
      <span className="block h-px flex-1 bg-slate-200" />
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? "text-brand-700" : "text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors " +
  "placeholder:text-slate-300";

// ─── Content ─────────────────────────────────────────────────────────────────

const RELATED_TOOLS = [
  { title: "ロット計算ツール",         desc: "口座資金、許容リスク、損切り幅からロット数を計算できます。",                  href: "/tools/lot-calculator",         icon: <Calculator className="w-4 h-4" /> },
  { title: "pips計算ツール",           desc: "エントリー価格と比較価格から、値幅をpips / pointsで確認できます。",           href: "/tools/pips-calculator",         icon: <Activity className="w-4 h-4" />  },
  { title: "リスクリワード計算ツール", desc: "エントリー価格、利確価格、ストップロス価格からRR比率を確認できます。",         href: "/tools/risk-reward-calculator",  icon: <Scale className="w-4 h-4" />     },
  { title: "期待値計算ツール",         desc: "勝率、平均利益、平均損失から取引ルールの期待値を計算できます。",               href: "/tools/expectancy-calculator",   icon: <BarChart3 className="w-4 h-4" /> },
  { title: "トレード日誌作成ツール",   desc: "取引内容を入力して、トレード日誌を作成・保存できます。",                      href: "/tools/trade-journal-template",  icon: <BookOpen className="w-4 h-4" />  },
];

const COMMON_MISTAKES = [
  { title: "pipsとpointsを混同する",           desc: "FX通貨ペアではpips、XAUUSDや株価指数CFDなどではpointsとして扱います。" },
  { title: "1lotあたりの通貨量を間違える",      desc: "同じ1lotでも、口座タイプや取引環境によって通貨量が異なる場合があります。" },
  { title: "CFDの1point価値を確認しない",       desc: "CFD銘柄では、業者ごとに1lotあたり1pointの損益が異なる場合があります。" },
  { title: "スプレッドや手数料を考慮しない",   desc: "このツールは入力値に基づく損益を計算するもので、スプレッド、手数料、スリッページなどは考慮していません。" },
  { title: "損益方向を間違える",                desc: "買いと売りでは、価格が上がった場合・下がった場合の損益方向が異なります。" },
  { title: "計算結果を売買判断として使う",      desc: "このツールは記録・計算支援を目的としたものであり、売買判断を推奨するものではありません。" },
];

const HOW_TO_STEPS = [
  "口座通貨を選ぶ",
  "通貨ペア・銘柄を選ぶ",
  "入力方法を選ぶ（値幅を直接入力 または エントリー価格と決済価格から計算）",
  "値幅を入力する、またはエントリー価格と決済価格を入力する",
  "ロット数を入力する",
  "FXの場合は1lotあたりの通貨量を選ぶ、CFDの場合は1lotあたり1pointの損益を入力する",
  "必要に応じて換算レートを入力する",
  "計算ボタンを押して想定損益を確認する",
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "損益計算ツールでは何ができますか？",
    answer: "通貨ペア・銘柄、ロット数、値幅を入力して、想定損益を計算できます。FX通貨ペアではpips、CFD銘柄ではpointsで計算します。",
  },
  {
    question: "pipsが分からなくても使えますか？",
    answer: "はい。エントリー価格と決済価格を入力すれば、通貨ペア・銘柄に応じてpipsまたはpointsを自動計算できます。",
  },
  {
    question: "XAUUSDやBTCUSDも計算できますか？",
    answer: "はい、計算できます。ただし、CFD銘柄はブローカーによって1lotあたりの価値や最小変動単位が異なる場合があります。",
  },
  {
    question: "JP225、US100、US500にも対応していますか？",
    answer: "はい、対応しています。これらの株価指数CFDではpointsとして値幅を計算します。",
  },
  {
    question: "スプレッドや手数料は含まれますか？",
    answer: "いいえ。このツールは入力された値幅とロット数に基づいて損益を計算するもので、スプレッド、手数料、スリッページ、スワップなどは考慮していません。",
  },
  {
    question: "口座通貨がJPYでEURUSDを計算できますか？",
    answer: "はい。口座通貨と損益通貨が異なる場合は、換算レートを入力することで口座通貨ベースの損益を確認できます。",
  },
  {
    question: "計算結果がブローカーの表示と違うことはありますか？",
    answer: "あります。ブローカーによって、1lotあたりの通貨量、最小取引数量、CFD銘柄の価値、手数料、スプレッド、スワップなどが異なる場合があります。",
  },
  {
    question: "このツールの結果で売買判断してよいですか？",
    answer: "このツールは記録・計算支援を目的とした参考ツールです。売買判断・投資助言・利益保証を目的としたものではありません。",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  relatedArticles: ArticleMeta[];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfitLossCalculatorClient({ relatedArticles }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [result, setResult] = useState<ProfitLossResult | null>(null);
  const [error, setError] = useState<string>("");

  const pd = PAIR_DATA[form.pair];
  const isCfd = pd?.isCfd ?? false;
  const unit = pd?.unit ?? "pips";
  const pipsLabel = unit === "pips" ? "値幅（pips）" : "値幅（points）";

  const convInfo = getConversionInfo(
    pd?.profitCurrency ?? "",
    form.accountCurrency
  );
  const needsConversion = convInfo.isNeeded;

  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setResult(null);
    setError("");
  }, []);

  const handleCalculate = useCallback(() => {
    const lots = parseFloat(form.lots);
    if (!lots || lots <= 0) { setError("ロット数を入力してください"); return; }

    let pipsInput: number | undefined;
    if (form.inputMethod === "direct") {
      pipsInput = parseFloat(form.pipsInput);
      if (isNaN(pipsInput) || pipsInput < 0) { setError("値幅を0以上の数値で入力してください"); return; }
    } else {
      const ep = parseFloat(form.entryPrice);
      const xp = parseFloat(form.exitPrice);
      if (!ep || ep <= 0 || !xp || xp <= 0) { setError("価格は0より大きい数値で入力してください"); return; }
    }

    if (needsConversion) {
      const rate = parseFloat(form.conversionRate);
      if (!rate || rate <= 0) { setError("換算レートを入力してください"); return; }
    }

    const cfdPV = isCfd ? parseFloat(form.cfdPointValue) : 1;
    if (isCfd && (isNaN(cfdPV) || cfdPV < 0)) { setError("1lotあたり1pointの損益を入力してください"); return; }

    const r = calculateProfitLoss({
      pair:           form.pair,
      inputMethod:    form.inputMethod,
      pipsInput:      form.inputMethod === "direct" ? pipsInput : undefined,
      profitDirection: form.profitDirection,
      entryPrice:     form.inputMethod === "prices" ? parseFloat(form.entryPrice) : undefined,
      exitPrice:      form.inputMethod === "prices" ? parseFloat(form.exitPrice)  : undefined,
      tradeDirection: form.tradeDirection,
      lots,
      lotUnits:       isCfd ? 1 : form.lotUnits,
      cfdPointValue:  cfdPV,
      accountCurrency: form.accountCurrency,
      conversionRate: needsConversion ? parseFloat(form.conversionRate) : undefined,
    });

    if (!r.isValid) {
      setError(r.errorMessage ?? "入力内容を確認してください");
      return;
    }

    trackToolCalculate("profit-loss-calculator", { pair: form.pair, inputMethod: form.inputMethod });
    setResult(r);
    setError("");
  }, [form, isCfd, needsConversion]);

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError("");
  }, []);

  const dirStyle = result ? getDirectionStyle(result.profitDirection) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ── Breadcrumbs ─────────────────────────────────────────────── */}
        <Breadcrumbs
          items={[
            { label: "ツール一覧", href: "/tools" },
            { label: "損益計算ツール" },
          ]}
        />

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            損益計算ツール
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
            通貨ペア・銘柄、ロット数、値幅を入力すると、想定損益を自動計算できます。
            pipsやpointsでの値幅を、実際の損益額として確認したい場合に活用できます。
          </p>
          <AffiliateDisclosure className="mt-3" />
          <DisclaimerBox variant="tool" />
        </div>

        {/* ── Main grid: form | result ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ═══ Left: Form ════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* ── 基本設定 ───────────────────────────────────────────────── */}
            <SectionTitle>基本設定</SectionTitle>

            {/* 口座通貨 */}
            <div>
              <FieldLabel>口座通貨</FieldLabel>
              <div className="flex gap-2">
                {(["JPY", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("accountCurrency", c)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      form.accountCurrency === c
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {c === "JPY" ? "日本円（JPY）" : "米ドル（USD）"}
                  </button>
                ))}
              </div>
            </div>

            {/* 通貨ペア */}
            <div>
              <FieldLabel htmlFor="pair">通貨ペア・銘柄</FieldLabel>
              <select
                id="pair"
                value={form.pair}
                onChange={(e) => set("pair", e.target.value)}
                className={inputCls}
              >
                {PAIR_GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.pairs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* ── 入力方法 ───────────────────────────────────────────────── */}
            <SectionTitle>値幅・価格の入力方法</SectionTitle>

            {/* 入力方法セレクタ */}
            <div>
              <FieldLabel>入力方法</FieldLabel>
              <div className="flex gap-2">
                {([
                  { val: "direct", label: "値幅を直接入力" },
                  { val: "prices", label: "エントリー価格と決済価格から計算" },
                ] as { val: InputMethod; label: string }[]).map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set("inputMethod", val)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      form.inputMethod === val
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 値幅直接入力モード */}
            {form.inputMethod === "direct" && (
              <>
                <div>
                  <FieldLabel htmlFor="pipsInput">{pipsLabel}</FieldLabel>
                  <input
                    type="number"
                    id="pipsInput"
                    value={form.pipsInput}
                    onChange={(e) => set("pipsInput", e.target.value)}
                    className={inputCls}
                    placeholder="例 25"
                    step="any"
                    min="0"
                  />
                </div>
                <div>
                  <FieldLabel>損益方向</FieldLabel>
                  <div className="flex gap-2">
                    {(["profit", "loss"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set("profitDirection", d)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                          form.profitDirection === d
                            ? d === "profit"
                              ? "bg-brand-600 text-white border-brand-600"
                              : "bg-red-500 text-white border-red-500"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {d === "profit" ? "▲ 利益" : "▼ 損失"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 価格入力モード */}
            {form.inputMethod === "prices" && (
              <>
                <div>
                  <FieldLabel>取引方向</FieldLabel>
                  <div className="flex gap-2">
                    {(["買い", "売り"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set("tradeDirection", d)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                          form.tradeDirection === d
                            ? d === "買い"
                              ? "bg-brand-600 text-white border-brand-600"
                              : "bg-red-500 text-white border-red-500"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {d === "買い" ? "▲ 買い" : "▼ 売り"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="entryPrice">エントリー価格</FieldLabel>
                  <input
                    type="number" id="entryPrice" step="any"
                    value={form.entryPrice}
                    onChange={(e) => set("entryPrice", e.target.value)}
                    className={inputCls} placeholder="例 150.000"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="exitPrice">決済価格</FieldLabel>
                  <input
                    type="number" id="exitPrice" step="any"
                    value={form.exitPrice}
                    onChange={(e) => set("exitPrice", e.target.value)}
                    className={inputCls} placeholder="例 150.250"
                  />
                </div>
              </>
            )}

            {/* ── ロット設定 ─────────────────────────────────────────────── */}
            <SectionTitle>ロット設定</SectionTitle>

            <div>
              <FieldLabel htmlFor="lots">ロット数</FieldLabel>
              <input
                type="number" id="lots" step="any"
                value={form.lots}
                onChange={(e) => set("lots", e.target.value)}
                className={inputCls} placeholder="例 0.40"
              />
            </div>

            {/* FX: 1lot通貨量 */}
            {!isCfd && (
              <div>
                <FieldLabel htmlFor="lotUnits">1lotあたりの通貨量</FieldLabel>
                <select
                  id="lotUnits"
                  value={form.lotUnits}
                  onChange={(e) => set("lotUnits", Number(e.target.value))}
                  className={inputCls}
                >
                  {LOT_UNIT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  1lotあたりの通貨量は、取引環境・口座タイプによって異なる場合があります。ご利用の口座仕様に合わせて選択してください。
                </p>
              </div>
            )}

            {/* CFD: 1point価値 */}
            {isCfd && (
              <div>
                <FieldLabel htmlFor="cfdPointValue">1lotあたり1pointの損益</FieldLabel>
                <input
                  type="number" id="cfdPointValue" step="any"
                  value={form.cfdPointValue}
                  onChange={(e) => set("cfdPointValue", e.target.value)}
                  className={inputCls} placeholder="例 1"
                />
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  CFD銘柄は業者によって1lotあたりの価値が異なるため、ご利用の取引環境に合わせて入力してください。
                </p>
              </div>
            )}

            {/* 換算レート（条件付き） */}
            {needsConversion && (
              <>
                <SectionTitle>換算レート</SectionTitle>
                <div>
                  <FieldLabel htmlFor="conversionRate">{convInfo.label}</FieldLabel>
                  <input
                    type="number" id="conversionRate" step="any"
                    value={form.conversionRate}
                    onChange={(e) => set("conversionRate", e.target.value)}
                    className={inputCls}
                    placeholder={form.accountCurrency === "JPY" ? "例 150.00" : "例 0.0067"}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    口座通貨と損益通貨が異なるため、換算レートを入力してください。
                  </p>
                </div>
              </>
            )}

            {/* ── Buttons ───────────────────────────────────────────────── */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                計算する
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-3 border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 text-sm rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                リセット
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* ═══ Right: Result card ════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              {/* Result header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">計算結果</span>
                {result && (
                  <span className="text-xs text-slate-400">{form.pair} · {result.accountCurrency}</span>
                )}
              </div>

              {result && dirStyle ? (
                <>
                  {/* Main result */}
                  <div className={`px-5 py-6 ${dirStyle.bg}`}>
                    <p className="text-xs font-semibold text-slate-500 mb-2">想定損益</p>
                    <div className={`flex items-baseline gap-2 ${dirStyle.text}`}>
                      <span className="text-4xl font-bold tabular-nums leading-none">
                        {result.profitDirection === "loss" ? "−" : result.profitDirection === "even" ? "±" : "+"}
                        {formatAmount(result.totalProfit, result.accountCurrency)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-2 ${dirStyle.text}`}>
                      {dirStyle.icon}
                      <span className="text-sm font-semibold">{dirStyle.label}</span>
                    </div>
                  </div>

                  {/* Sub-metrics */}
                  <div className="px-5 py-4 space-y-0">
                    <ResultRow
                      label={`値幅`}
                      value={formatPips(result.pips, result.unit)}
                    />
                    <ResultRow
                      label={`1${result.unit === "pips" ? "pips" : "point"}あたり損益`}
                      value={formatPerUnit(result.profitPerUnit, result.accountCurrency, result.unit)}
                      highlight
                    />
                    <ResultRow label="ロット数"       value={`${parseFloat(form.lots)} lot`} />
                    <ResultRow label="通貨ペア・銘柄"  value={form.pair} />
                    <ResultRow label="口座通貨"        value={result.accountCurrency} />
                    {result.conversionNeeded && result.conversionRate && (
                      <ResultRow
                        label={result.conversionLabel}
                        value={result.conversionRate.toLocaleString("en-US", { maximumFractionDigits: 5 })}
                      />
                    )}
                  </div>

                  {/* Notes */}
                  <div className="px-5 py-4 bg-amber-50 border-t border-amber-100 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        この損益は入力値に基づく参考値です。スプレッド、手数料、スリッページ、スワップなどは考慮していません。
                      </p>
                    </div>
                    {result.isCfd && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          CFD銘柄の1lotあたりの価値や最小変動単位は業者によって異なる場合があります。
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Placeholder */
                <div className="px-5 py-12 flex flex-col items-center gap-3 text-center">
                  <Calculator className="w-10 h-10 text-slate-200" />
                  <p className="text-sm text-slate-400">
                    入力して「計算する」を押してください
                  </p>
                  <p className="text-xs text-slate-300">
                    デフォルト：USDJPY 25pips 0.40lot
                    <br />
                    → 想定損益：+10,000円
                  </p>
                </div>
              )}
            </div>

          {/* Fintokei Square Banner */}
          <div className="relative banner-hover-lift">
            <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
            <a
              href="https://www.fintokei.com/jp/?affiliate=987"
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick("Fintokei", "https://www.fintokei.com/jp/?affiliate=987")}
              className="block rounded-xl overflow-hidden border border-slate-100"
            >
              <Image src="/images/affiliates/fintokei_square.png" alt="Fintokei" width={500} height={500} className="w-full h-auto" />
            </a>
          </div>

            {/* Quick reference sidebar */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-600">pip / point サイズ早見表</p>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { label: "JPYペア（USDJPY等）", val: "0.01" },
                  { label: "その他FXペア",         val: "0.0001" },
                  { label: "XAUUSD",               val: "0.01" },
                  { label: "BTCUSD / 株価指数CFD", val: "1" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between px-4 py-2 ${
                      pd && (
                        (row.label.includes("JPY") && pd.pipSize === 0.01 && !pd.isCfd && pd.profitCurrency === "JPY") ||
                        (row.label.includes("その他FX") && pd.pipSize === 0.0001) ||
                        (row.label === "XAUUSD" && form.pair === "XAUUSD") ||
                        (row.label.includes("BTC") && (form.pair === "BTCUSD" || ["JP225","US100","US500"].includes(form.pair)))
                      )
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-slate-600"
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className="font-mono">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 計算式の考え方 ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">損益計算の考え方</h2>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            損益計算では、値幅、ロット数、1pipsまたは1pointあたりの損益を使って、想定損益を計算します。
            FX通貨ペアでは値幅をpipsで、CFD銘柄ではpointsで計算します。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FX */}
            <div className="border border-brand-100 bg-brand-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">FX通貨ペア</p>
              <div className="bg-white border border-brand-100 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 space-y-1">
                <p>1pipsあたり損益</p>
                <p className="text-brand-600 font-semibold pl-2">= 1lotあたりの通貨量 × pipSize × ロット数</p>
                <p className="mt-1">想定損益</p>
                <p className="text-brand-600 font-semibold pl-2">= 値幅(pips) × 1pipsあたり損益</p>
              </div>
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <p className="font-semibold text-slate-700">例：USDJPY / 0.40lot / 25pips</p>
                <p>1pipsあたり損益 = 100,000 × 0.01 × 0.40 = <span className="font-semibold text-brand-600">400円</span></p>
                <p>想定損益 = 25 × 400 = <span className="font-semibold text-brand-600">10,000円</span></p>
              </div>
            </div>

            {/* CFD */}
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">CFD銘柄</p>
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 space-y-1">
                <p>1pointあたり損益</p>
                <p className="text-brand-600 font-semibold pl-2">= 1lotあたり1pointの損益 × ロット数</p>
                <p className="mt-1">想定損益</p>
                <p className="text-brand-600 font-semibold pl-2">= 値幅(points) × 1pointあたり損益</p>
              </div>
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <p className="font-semibold text-slate-700">例：XAUUSD / 0.20lot / 500points</p>
                <p>1pointあたり損益 = 1 × 0.20 = <span className="font-semibold text-slate-700">0.20 USD</span></p>
                <p>想定損益 = 500 × 0.20 = <span className="font-semibold text-slate-700">100 USD</span></p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            ※ CFD銘柄はブローカーによって1lotあたりの価値や最小変動単位が異なる場合があります。口座通貨と損益通貨が異なる場合は、換算レートで口座通貨に変換します。
          </p>
        </section>

        {/* ── 使い方 ─────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">損益計算ツールの使い方</h2>
          <div className="space-y-2">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-3.5 border border-slate-200 rounded-xl bg-white">
                <span className="w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── よくあるミス ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">よくあるミス</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMON_MISTAKES.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl bg-white">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">{m.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 関連ツール ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">関連ツール</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => trackRelatedToolClick(tool.title)}
                className="flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 shrink-0">
                    {tool.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                      {tool.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

      {/* Funded7 Wide Banner */}
      <div className="relative mb-10 banner-hover-lift">
        <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
        <a
          href="https://my.funded7.com/ja/sign-up?affiliateId=MogusaFX"
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackAffiliateClick("Funded7", "https://my.funded7.com/ja/sign-up?affiliateId=MogusaFX")}
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/funded7_banner.png" alt="Funded7" width={1200} height={160} className="w-full h-auto" />
        </a>
      </div>


        {/* ── 関連記事 ─────────────────────────────────────────────────────── */}
        {relatedArticles.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">関連記事</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* ── アフィリエイト枠 ─────────────────────────────────────────────── */}
        <AffiliateSection itemIds={TOOL_AFFILIATE_MAP["profit-loss-calculator"] ?? []} />

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-5">よくある質問</h2>
          <FAQSection items={FAQ_ITEMS} />
        </section>

        {/* ── Disclaimer ────────────────────────────────────────────────── */}
        <DisclaimerBox />
      </div>
    </div>
  );
}
