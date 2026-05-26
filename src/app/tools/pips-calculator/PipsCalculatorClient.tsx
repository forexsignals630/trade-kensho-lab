"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import AffiliateSection from "@/components/AffiliateSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { TOOL_AFFILIATE_MAP } from "@/data/affiliateItems";
import { calculatePips, type CalcType, type Direction } from "@/lib/calculations/pipsCalc";
import { trackToolCalculate, trackRelatedToolClick, trackAffiliateClick } from "@/lib/analytics";
import type { ArticleMeta } from "@/types/article";

// ─── Types ───────────────────────────────────────────────────────────────────

type PairCode =
  | "AUDUSD" | "EURUSD" | "GBPJPY" | "GBPUSD" | "NZDUSD"
  | "USDCAD" | "USDCHF" | "USDJPY" | "XAUUSD" | "BTCUSD"
  | "JP225"  | "US100"  | "US500"
  | "AUDCAD" | "AUDJPY" | "AUDCHF" | "AUDNZD"
  | "CADCHF" | "CHFJPY"
  | "EURAUD" | "EURCAD" | "EURCHF" | "EURGBP" | "EURJPY" | "EURNZD"
  | "GBPAUD" | "GBPCAD" | "GBPCHF" | "GBPNZD"
  | "NZDJPY" | "NZDCAD" | "NZDCHF" | "CADJPY";

interface FormState {
  pair:         PairCode;
  calcType:     CalcType;
  direction:    Direction;
  entryPrice:   number;
  comparePrice: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CFD_PAIRS = new Set<PairCode>(["XAUUSD", "BTCUSD", "JP225", "US100", "US500"]);

const PIP_SIZE: Record<PairCode, number> = {
  GBPJPY: 0.01, AUDJPY: 0.01, CHFJPY: 0.01, EURJPY: 0.01,
  NZDJPY: 0.01, CADJPY: 0.01, USDJPY: 0.01,
  AUDUSD: 0.0001, EURUSD: 0.0001, GBPUSD: 0.0001, NZDUSD: 0.0001,
  USDCAD: 0.0001, USDCHF: 0.0001,
  AUDCAD: 0.0001, AUDCHF: 0.0001, AUDNZD: 0.0001,
  CADCHF: 0.0001,
  EURAUD: 0.0001, EURCAD: 0.0001, EURCHF: 0.0001, EURGBP: 0.0001, EURNZD: 0.0001,
  GBPAUD: 0.0001, GBPCAD: 0.0001, GBPCHF: 0.0001, GBPNZD: 0.0001,
  NZDCAD: 0.0001, NZDCHF: 0.0001,
  XAUUSD: 0.01, BTCUSD: 1, JP225: 1, US100: 1, US500: 1,
};

const PRICE_STEP: Record<PairCode, string> = {
  GBPJPY: "0.001", AUDJPY: "0.001", CHFJPY: "0.001", EURJPY: "0.001",
  NZDJPY: "0.001", CADJPY: "0.001", USDJPY: "0.001",
  AUDUSD: "0.00001", EURUSD: "0.00001", GBPUSD: "0.00001", NZDUSD: "0.00001",
  USDCAD: "0.00001", USDCHF: "0.00001",
  AUDCAD: "0.00001", AUDCHF: "0.00001", AUDNZD: "0.00001",
  CADCHF: "0.00001",
  EURAUD: "0.00001", EURCAD: "0.00001", EURCHF: "0.00001", EURGBP: "0.00001", EURNZD: "0.00001",
  GBPAUD: "0.00001", GBPCAD: "0.00001", GBPCHF: "0.00001", GBPNZD: "0.00001",
  NZDCAD: "0.00001", NZDCHF: "0.00001",
  XAUUSD: "0.01", BTCUSD: "1", JP225: "1", US100: "0.25", US500: "0.25",
};

// USDJPY デフォルト: entry 150.000, compare 149.750 (買い→損失方向 25pips)
const DEFAULT_FORM: FormState = {
  pair:         "USDJPY",
  calcType:     "exit",
  direction:    "buy",
  entryPrice:   150.000,
  comparePrice: 149.750,
};

const CALC_TYPE_LABELS: Record<CalcType, string> = {
  exit: "エントリー価格と決済価格で計算",
  sl:   "エントリー価格とストップロス価格で計算",
  tp:   "エントリー価格と利確価格で計算",
};

const COMPARE_LABELS: Record<CalcType, string> = {
  exit: "決済価格",
  sl:   "ストップロス価格",
  tp:   "利確価格",
};

// ─── Grouped pairs for <optgroup> ─────────────────────────────────────────────

const PAIR_GROUPS: { label: string; pairs: PairCode[] }[] = [
  {
    label: "メジャーFX",
    pairs: ["AUDUSD", "EURUSD", "GBPUSD", "NZDUSD", "USDCAD", "USDCHF", "USDJPY"],
  },
  {
    label: "クロス円",
    pairs: ["GBPJPY", "AUDJPY", "CHFJPY", "EURJPY", "NZDJPY", "CADJPY"],
  },
  {
    label: "クロス通貨",
    pairs: [
      "AUDCAD", "AUDCHF", "AUDNZD", "CADCHF",
      "EURAUD", "EURCAD", "EURCHF", "EURGBP", "EURNZD",
      "GBPAUD", "GBPCAD", "GBPCHF", "GBPNZD",
      "NZDCAD", "NZDCHF",
    ],
  },
  {
    label: "CFD・その他",
    pairs: ["XAUUSD", "BTCUSD", "JP225", "US100", "US500"],
  },
];

// ─── Static data ─────────────────────────────────────────────────────────────

interface RelatedTool { title: string; description: string; href: string; icon: string }

const RELATED_TOOLS: RelatedTool[] = [
  { title: "損益計算ツール",           description: "通貨ペア・銘柄、ロット数、値幅から想定損益を計算できます",             href: "/tools/profit-loss-calculator",    icon: "💵" },
  { title: "ロット計算ツール",         description: "口座資金、許容リスク、損切り幅からロット数を計算できます",               href: "/tools/lot-calculator",            icon: "🧮" },
  { title: "リスクリワード計算ツール", description: "エントリー価格、利確価格、SL価格からRR比率を確認できます",             href: "/tools/risk-reward-calculator",    icon: "⚖️" },
  { title: "期待値計算ツール",         description: "勝率、平均利益、平均損失から取引ルールの期待値を計算できます",         href: "/tools/expectancy-calculator",     icon: "📊" },
];

const COMMON_MISTAKES = [
  {
    title: "JPYペアとそれ以外のpipSizeを混同する",
    desc: "USDJPYなどのJPYペアでは1pips = 0.01、それ以外の多くのFX通貨ペアでは1pips = 0.0001として計算します。単位を間違えると値幅が100倍ズレます。",
  },
  {
    title: "pipsとpointsを混同する",
    desc: "FX通貨ペアではpips、XAUUSDや株価指数CFDなどではpointsとして扱います。このツールは銘柄に応じて自動で切り替えます。",
  },
  {
    title: "取引方向を確認しない",
    desc: "買いと売りでは、同じ価格差でも利益方向・損失方向の判定が変わります。計算前に方向を確認してください。",
  },
  {
    title: "スプレッドや手数料を考慮しない",
    desc: "このツールは価格差から値幅を計算するものであり、スプレッド、手数料、スリッページは考慮されていません。",
  },
  {
    title: "CFD銘柄の仕様を確認しない",
    desc: "CFD銘柄は業者によって最小変動単位や表示仕様が異なる場合があります。計算結果はご利用の取引環境でご確認ください。",
  },
  {
    title: "計算結果を売買判断として使う",
    desc: "このツールは記録・計算支援を目的としたものであり、売買判断を推奨するものではありません。",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "pipsとは何ですか？",
    answer:
      "pipsとは、FX通貨ペアの値動きを表す単位です。\n\nUSDJPYなどのJPYペアでは一般的に0.01が1pips、それ以外の多くのFX通貨ペアでは0.0001が1pipsとして扱われます。\n\nこのツールでは、通貨ペアを選ぶと自動でpipSizeが設定されます。",
  },
  {
    question: "pipsが分からなくても使えますか？",
    answer:
      "はい。通貨ペア・銘柄、エントリー価格、比較価格を入力すれば、ツールが自動でpipsまたはpointsを計算します。\n\npipsの知識がなくても、チャート上の価格をそのまま入力するだけで利用できます。",
  },
  {
    question: "XAUUSDやBTCUSDも計算できますか？",
    answer:
      "はい、計算できます。\n\nただし、XAUUSDやBTCUSDはpipsではなくpointsとして表示します。\n\n銘柄や業者によって表示仕様が異なる場合があります。",
  },
  {
    question: "JP225、US100、US500にも対応していますか？",
    answer:
      "はい、対応しています。\n\nこれらの株価指数CFDはpointsとして値幅を計算します。\n\nただしCFD銘柄は業者によって最小変動単位が異なる場合があります。",
  },
  {
    question: "買いと売りで計算結果は変わりますか？",
    answer:
      "値幅（pips数）そのものは価格差から計算するため同じです。\n\nただし、買いと売りでは、その値幅が利益方向なのか損失方向なのかの判定が変わります。",
  },
  {
    question: "スプレッドや手数料は含まれますか？",
    answer:
      "いいえ。このツールは入力された価格差からpipsまたはpointsを計算するものであり、スプレッド、手数料、スリッページなどは考慮していません。",
  },
  {
    question: "計算結果をロット計算に使えますか？",
    answer:
      "はい。計算したpipsやpointsは、ロット計算ツールやリスクリワード計算ツールで損切り幅や利確幅として活用できます。",
  },
  {
    question: "このツールの結果で売買判断してよいですか？",
    answer:
      "このツールは記録・計算支援を目的とした参考ツールです。\n\n売買判断・投資助言・利益保証を目的としたものではありません。\n\n実際の取引判断は、ご自身のトレードルールと責任のもとで行ってください。",
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  relatedArticles: ArticleMeta[];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PipsCalculatorClient({ relatedArticles }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const isCfd    = CFD_PAIRS.has(form.pair);
  const pipSize  = PIP_SIZE[form.pair] ?? 0.0001;
  const priceStep = PRICE_STEP[form.pair] ?? "0.00001";

  const result = calculatePips({
    entryPrice:   form.entryPrice,
    comparePrice: form.comparePrice,
    pipSize,
    isCfd,
    direction: form.direction,
  });

  const compareLabel = COMPARE_LABELS[form.calcType];

  function setNum(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
  }

  const reset = () => setForm(DEFAULT_FORM);
  const handleCalculate = () =>
    trackToolCalculate("pips-calculator", form as unknown as Record<string, unknown>);

  const inputCls =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white";

  // Result display styling
  const verdictBg =
    !result.isValid        ? "bg-slate-200" :
    result.pipDirection === "profit" ? "bg-brand-600" :
    result.pipDirection === "loss"   ? "bg-red-600"   :
    "bg-slate-500";

  const verdictText =
    !result.isValid        ? "text-slate-600" :
    result.pipDirection === "profit" ? "text-white" :
    result.pipDirection === "loss"   ? "text-white"   :
    "text-white";

  const verdictSubText =
    !result.isValid        ? "text-slate-400" :
    result.pipDirection === "profit" ? "text-brand-100" :
    result.pipDirection === "loss"   ? "text-red-100"   :
    "text-slate-200";

  const DirectionIcon =
    result.pipDirection === "profit" ? TrendingUp :
    result.pipDirection === "loss"   ? TrendingDown :
    Minus;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "無料ツール", href: "/tools" }, { label: "pips計算ツール" }]} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mt-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">pips計算ツール</h1>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          通貨ペア・銘柄、エントリー価格、決済価格を入力すると、価格差を pips または points で自動計算できます。
          損切り幅、利確幅、トレード日誌への記録に活用できます。
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["無料", "登録不要", "ブラウザで利用可能"].map((b) => (
            <span key={b} className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">{b}</span>
          ))}
        </div>
      </div>

      <AffiliateDisclosure className="mb-4" />
      <DisclaimerBox variant="tool" className="mb-8" />

      {/* ── Calculator grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mb-10">

        {/* ── Form card ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 min-w-0 overflow-hidden">
          <h2 className="font-bold text-slate-800 mb-1 text-base">計算条件を入力</h2>
          <p className="text-xs text-slate-500 mb-6">価格を入力すると、pipsまたはpointsをリアルタイムで計算します。</p>

          <div className="space-y-5">

            {/* ① 通貨ペア・銘柄 */}
            <div>
              <FieldLabel num={1} label="通貨ペア・銘柄" />
              <select
                value={form.pair}
                onChange={(e) => setForm((prev) => ({ ...prev, pair: e.target.value as PairCode }))}
                className={inputCls}
              >
                {PAIR_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.pairs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1.5">
                {isCfd
                  ? `CFD銘柄 — pointsで計算（1point = ${pipSize}）`
                  : `FX通貨ペア — pipsで計算（1pip = ${pipSize}）`}
              </p>
            </div>

            {/* ② 計算タイプ */}
            <div>
              <FieldLabel num={2} label="計算タイプ" />
              <div className="space-y-2">
                {(["exit", "sl", "tp"] as CalcType[]).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setForm((prev) => ({ ...prev, calcType: ct }))}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                      form.calcType === ct
                        ? "bg-brand-600 text-white border-brand-600 font-semibold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {CALC_TYPE_LABELS[ct]}
                  </button>
                ))}
              </div>
            </div>

            {/* ③ 取引方向 */}
            <div>
              <FieldLabel num={3} label="取引方向" />
              <div className="flex gap-3">
                {(["buy", "sell"] as Direction[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((prev) => ({ ...prev, direction: d }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors border flex items-center justify-center gap-1.5 ${
                      form.direction === d
                        ? d === "buy"
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-red-600 text-white border-red-600"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {d === "buy"
                      ? <><TrendingUp className="w-4 h-4" />買い</>
                      : <><TrendingDown className="w-4 h-4" />売り</>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                利益方向・損失方向の判定に使用します
              </p>
            </div>

            {/* ④ エントリー価格 */}
            <div>
              <FieldLabel num={4} label="エントリー価格" />
              <input
                type="number"
                value={form.entryPrice}
                onChange={setNum("entryPrice")}
                step={priceStep}
                min={0}
                className={inputCls}
              />
            </div>

            {/* ⑤ 比較価格 */}
            <div>
              <FieldLabel num={5} label={compareLabel} />
              <input
                type="number"
                value={form.comparePrice}
                onChange={setNum("comparePrice")}
                step={priceStep}
                min={0}
                className={inputCls}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Calculator className="w-4 h-4" />
              pipsを計算する
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              リセット
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            ※ リアルタイムで計算されます。スプレッドや手数料は含まれません。
          </p>
        </div>

        {/* ── Result card ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">計算結果</h2>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            {result.isValid ? (
              <>
                {/* Big pips display */}
                <div className={`${verdictBg} rounded-xl p-4 text-center mb-4`}>
                  <div className={`flex items-center justify-center gap-1.5 mb-1 ${verdictSubText}`}>
                    <DirectionIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{result.directionLabel}</span>
                  </div>
                  <p className={`text-xs mb-2 ${verdictSubText}`}>値幅</p>
                  <p className={`text-4xl font-extrabold tabular-nums leading-none ${verdictText}`}>
                    {result.pips.toFixed(result.pips >= 100 ? 0 : result.pips >= 10 ? 1 : 2)}
                    <span className="text-xl font-bold ml-2">{result.unit}</span>
                  </p>
                </div>

                {/* Sub-metrics */}
                <div className="space-y-2.5">
                  <ResultRow label="通貨ペア・銘柄" value={form.pair} />
                  <ResultRow label="取引方向"       value={form.direction === "buy" ? "買い（Long）" : "売り（Short）"} />
                  <ResultRow label="エントリー価格" value={`${form.entryPrice}`}    highlight />
                  <ResultRow label={compareLabel}    value={`${form.comparePrice}`} highlight />
                  <ResultRow label="計算単位"        value={result.pipSizeLabel} />
                </div>

                {/* Inline formula */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">計算式</p>
                  <p className="text-xs font-mono text-slate-700 break-all">
                    |{form.comparePrice} − {form.entryPrice}| ÷ {pipSize}
                    {" "}= <strong className={
                      result.pipDirection === "profit" ? "text-brand-700"  :
                      result.pipDirection === "loss"   ? "text-red-700"    : "text-slate-700"
                    }>
                      {result.pips.toFixed(2)} {result.unit}
                    </strong>
                  </p>
                </div>

                {/* CFD warning */}
                {isCfd && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      CFD銘柄の最小変動単位や表示仕様は業者によって異なる場合があります。ご利用の取引環境に合わせて確認してください。
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Error state */
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-700 font-medium">
                  {result.errorMessage ?? "入力値を確認してください"}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 mt-4 leading-relaxed text-center">
              この値幅は価格差に基づく計算結果です。<br className="hidden sm:block" />
              スプレッド、手数料、スリッページは考慮していません。
            </p>
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

          {/* pip size reference */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-600 mb-3">pipサイズ一覧</p>
            <div className="space-y-2">
              {[
                { label: "JPYペア（USDJPY等）", size: "0.01" },
                { label: "主要FX（EURUSD等）",  size: "0.0001" },
                { label: "XAUUSD",               size: "0.01（point）" },
                { label: "BTCUSD / JP225 / US100 / US500", size: "1（point）" },
              ].map((row) => (
                <div key={row.label} className={`flex justify-between items-center px-3 py-1.5 rounded-lg text-xs ${
                  (!isCfd && PIP_SIZE[form.pair] === parseFloat(row.size.replace("（point）","").replace("（pip）",""))) ||
                  (isCfd && form.pair === "XAUUSD" && row.label === "XAUUSD") ||
                  (isCfd && form.pair !== "XAUUSD" && row.label.includes("BTCUSD"))
                    ? "bg-brand-50 border border-brand-100 text-brand-700 font-semibold"
                    : "text-slate-500"
                }`}>
                  <span>{row.label}</span>
                  <span className="font-mono">{row.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 計算式の考え方 ──────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-5">pips / points の計算式</h2>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          pips計算では、エントリー価格と比較価格の差を、通貨ペアごとの pipSize で割って値幅を求めます。
        </p>

        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-brand-600 mb-2">基本式</p>
          <p className="font-mono text-sm font-bold text-slate-800">
            値幅 = |比較価格 − エントリー価格| ÷ pipSize（またはpointSize）
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 mb-3">FX通貨ペアのpipSize</p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><strong>JPYペア：</strong>1pips = 0.01（USDJPY, EURJPY, GBPJPY 等）</li>
              <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span><strong>その他FX：</strong>1pips = 0.0001（EURUSD, GBPUSD 等）</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-800 mb-3">CFD銘柄のpointSize</p>
            <ul className="space-y-1.5 text-xs text-amber-700">
              <li className="flex gap-2"><span className="shrink-0">•</span><strong>XAUUSD：</strong>1point = 0.01</li>
              <li className="flex gap-2"><span className="shrink-0">•</span><strong>BTCUSD / JP225 / US100 / US500：</strong>1point = 1</li>
            </ul>
          </div>
        </div>

        {/* 計算例 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">計算例</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p className="text-slate-500 mb-2">例1：USDJPY</p>
              <ul className="space-y-1 font-mono">
                <li>エントリー：150.000</li>
                <li>比較価格：149.750</li>
                <li>差 = 0.250</li>
                <li>= 0.250 ÷ 0.01 = <strong className="text-brand-700">25 pips</strong></li>
              </ul>
            </div>
            <div>
              <p className="text-slate-500 mb-2">例2：EURUSD</p>
              <ul className="space-y-1 font-mono">
                <li>エントリー：1.08500</li>
                <li>比較価格：1.08250</li>
                <li>差 = 0.00250</li>
                <li>= 0.00250 ÷ 0.0001 = <strong className="text-brand-700">25 pips</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 使い方 ───────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-5">pips計算ツールの使い方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "通貨ペア・銘柄を選ぶ",
              desc: "USDJPY、EURUSD、XAUUSD、BTCUSD、US100などから選択します。選択内容に応じてpipsまたはpointsで自動計算します。",
            },
            {
              step: 2,
              icon: <Calculator className="w-5 h-5 text-brand-600" />,
              title: "計算タイプを選ぶ",
              desc: "決済価格、ストップロス価格、利確価格のどれと比較するかを選びます。",
            },
            {
              step: 3,
              icon: <TrendingUp className="w-5 h-5 text-brand-600" />,
              title: "取引方向を選ぶ",
              desc: "買い・売りを選択します。利益方向か損失方向かの判定に使います。",
            },
            {
              step: 4,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "エントリー価格を入力する",
              desc: "実際にエントリーした価格、または想定エントリー価格を入力します。",
            },
            {
              step: 5,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "比較価格を入力する",
              desc: "決済価格、ストップロス価格、利確価格などを入力します。",
            },
            {
              step: 6,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "計算結果を確認する",
              desc: "値幅、利益方向・損失方向、使用した計算単位をリアルタイムで確認できます。",
            },
            {
              step: 7,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "他のツールや日誌に活用する",
              desc: "計算したpipsやpointsは、ロット計算、リスクリワード計算、トレード日誌の記録に活用できます。",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-brand-600">STEP {item.step}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── よくあるミス ─────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-5">よくあるミス</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COMMON_MISTAKES.map((m) => (
            <div key={m.title} className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-0.5">{m.title}</p>
                <p className="text-xs text-amber-700 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 関連ツール ───────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 pt-8 mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RELATED_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => trackRelatedToolClick(tool.title)}
              className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl shrink-0">{tool.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">{tool.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tool.description}</p>
                <span className="inline-flex items-center gap-0.5 text-xs text-brand-600 mt-2 font-medium">
                  ツールを開く <ArrowRight className="w-3 h-3" />
                </span>
              </div>
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


      {/* ── 関連記事 ─────────────────────────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">関連記事</h2>
            <Link href="/articles" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              記事一覧 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* ── アフィリエイト枠 ────────────────────────────────────────────────── */}
      <AffiliateSection itemIds={TOOL_AFFILIATE_MAP["pips-calculator"] ?? []} />

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">よくある質問（FAQ）</h2>
        <FAQSection items={FAQ_ITEMS} />
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            このツールは記録・計算支援を目的としたものであり、売買判断・投資助言・利益保証を目的としたものではありません。計算結果は入力値に基づく参考値であり、実際の損益や取引条件を保証するものではありません。
          </p>
        </div>
      </section>

      <DisclaimerBox />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {num}
      </span>
      <label className="text-sm font-medium text-slate-700">{label}</label>
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${highlight ? "bg-brand-50 border border-brand-100" : "bg-slate-50"}`}>
      <span className={`text-xs ${highlight ? "text-brand-600 font-medium" : "text-slate-500"}`}>{label}</span>
      <span className={`text-sm font-bold tabular-nums ${highlight ? "text-brand-700" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
