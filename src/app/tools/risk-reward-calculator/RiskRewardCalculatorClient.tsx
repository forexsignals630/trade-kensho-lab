"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle2,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import AffiliateSection from "@/components/AffiliateSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { TOOL_AFFILIATE_MAP } from "@/data/affiliateItems";
import { calculateRiskReward } from "@/lib/calculations/riskReward";
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
  pair: PairCode;
  direction: "buy" | "sell";
  entryPrice: number;
  takeProfitPrice: number;
  stopLossPrice: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_PAIRS: PairCode[] = [
  "AUDUSD", "EURUSD", "GBPJPY", "GBPUSD", "NZDUSD",
  "USDCAD", "USDCHF", "USDJPY", "XAUUSD", "BTCUSD",
  "JP225",  "US100",  "US500",
  "AUDCAD", "AUDJPY", "AUDCHF", "AUDNZD",
  "CADCHF", "CHFJPY",
  "EURAUD", "EURCAD", "EURCHF", "EURGBP", "EURJPY", "EURNZD",
  "GBPAUD", "GBPCAD", "GBPCHF", "GBPNZD",
  "NZDJPY", "NZDCAD", "NZDCHF", "CADJPY",
];

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

// USDJPY デフォルト: entry 150.00, TP 150.50 (+50pips), SL 149.75 (-25pips) → RR 1:2.0
const DEFAULT_FORM: FormState = {
  pair: "USDJPY",
  direction: "buy",
  entryPrice: 150.000,
  takeProfitPrice: 150.500,
  stopLossPrice: 149.750,
};

function isCFD(pair: PairCode): boolean { return CFD_PAIRS.has(pair); }

// ─── Static data ─────────────────────────────────────────────────────────────

interface RelatedTool { title: string; description: string; href: string; icon: string }

const RELATED_TOOLS: RelatedTool[] = [
  { title: "損益計算ツール",           description: "ロット数と値幅から想定損益を計算",     href: "/tools/profit-loss-calculator",    icon: "💵" },
  { title: "ロット計算ツール",         description: "適正ロット数を資金管理から算出",         href: "/tools/lot-calculator",            icon: "🧮" },
  { title: "期待値計算ツール",         description: "勝率×損益比から戦略の期待値を確認",    href: "/tools/expectancy-calculator",     icon: "📊" },
  { title: "pips計算ツール",           description: "価格差をpipsまたはpointsで確認",        href: "/tools/pips-calculator",           icon: "📐" },
];

const COMMON_MISTAKES = [
  {
    title: "買いと売りの方向を間違える",
    desc: "買いの場合はSLがエントリーより低く、利確が高い。売りはその逆です。方向を間違えるとRR比が正しく計算されません。",
  },
  {
    title: "利確価格とストップロス価格を逆に入力する",
    desc: "USDJPY買いで利確が149.00、SLが151.00のように逆に入力してもエラーが表示されます。入力前に方向を確認してください。",
  },
  {
    title: "リスクリワード比率だけで取引判断をする",
    desc: "RR比は損切り幅と利確幅の比率を示す指標です。エントリーの可否や相場の方向性を保証するものではありません。",
  },
  {
    title: "スプレッドや手数料を考慮しない",
    desc: "実際の取引では、スプレッドや取引手数料が損益に影響します。計算結果は理論値であり、実際の損益とは異なる場合があります。",
  },
  {
    title: "勝率とセットで考えない",
    desc: "RR比1:2であっても、勝率が低ければ期待値はマイナスになることがあります。勝率と合わせて期待値を確認することが重要です。",
  },
  {
    title: "計算結果を利益保証のように受け取る",
    desc: "このツールは記録・計算支援を目的としたものです。計算結果は参考値であり、利益を保証するものではありません。",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "リスクリワードとは何ですか？",
    answer:
      "損切り幅に対して、利確幅がどれくらいあるかを示す比率です。\n\nたとえば損切り25pips、利確50pipsなら、リスクリワードは1:2です。\n\n損切り幅1に対して利確幅が何倍あるかを数値で表し、取引条件の確認やトレード日誌の記録に活用されます。",
  },
  {
    question: "リスクリワードが高ければ良いトレードですか？",
    answer:
      "必ずしもそうではありません。\n\nリスクリワードは取引条件を確認するための指標であり、勝率、相場環境、ルール遵守などと合わせて検証する必要があります。\n\nたとえばRR比1:5であっても、勝率が極端に低ければ期待値はマイナスになることがあります。このツールでは特定のRR比を推奨しません。",
  },
  {
    question: "pipsが分からなくても使えますか？",
    answer:
      "はい、使えます。\n\nエントリー価格、利確価格、ストップロス価格を入力すると、選択した通貨ペア・銘柄に応じてpipsまたはpointsを自動で計算します。\n\npipsの知識がなくても、チャート上の価格をそのまま入力するだけで利用できます。",
  },
  {
    question: "XAUUSDや株価指数CFDにも使えますか？",
    answer:
      "はい、使えます。\n\nXAUUSD・BTCUSD・JP225・US100・US500などのCFD銘柄を選ぶと、pipsではなくpointsとして計算・表示します。\n\nただし、CFD銘柄はブローカーによって最小変動単位や損益計算が異なる場合があります。計算結果はご利用の取引環境でご確認ください。",
  },
  {
    question: "計算結果を使って売買判断してよいですか？",
    answer:
      "このツールは記録・計算支援を目的とした参考ツールです。\n\n売買判断・投資助言・利益保証を目的としたものではありません。\n\n実際の取引判断は、ご自身のトレードルールと責任のもとで行ってください。",
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  relatedArticles: ArticleMeta[];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RiskRewardCalculatorClient({ relatedArticles }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const isCfd      = isCFD(form.pair);
  const pipSize    = PIP_SIZE[form.pair] ?? 0.0001;
  const priceStep  = PRICE_STEP[form.pair] ?? "0.00001";

  const result = calculateRiskReward({
    entryPrice: form.entryPrice,
    takeProfitPrice: form.takeProfitPrice,
    stopLossPrice: form.stopLossPrice,
    direction: form.direction,
    pipSize,
    isCfd,
  });

  const unit = result.unit;

  function setNum(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
  }

  const reset = () => setForm(DEFAULT_FORM);

  const handleCalculate = () =>
    trackToolCalculate("risk-reward-calculator", form as unknown as Record<string, unknown>);

  const inputCls =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white";

  // 方向ヒント
  const directionHint =
    form.direction === "buy"
      ? "買い：利確 > エントリー > SL（上方向）"
      : "売り：利確 < エントリー < SL（下方向）";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "無料ツール", href: "/tools" }, { label: "リスクリワード計算ツール" }]} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mt-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">リスクリワード計算ツール</h1>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          エントリー価格、利確価格、ストップロス価格を入力すると、想定利益・想定損失・リスクリワード比率を自動計算できます。
          取引前の確認や、トレード日誌への記録に活用できます。
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
          <p className="text-xs text-slate-500 mb-6">価格を入力すると、リスクリワード比率をリアルタイムで計算します。</p>

          <div className="space-y-5">

            {/* ① 通貨ペア・銘柄 */}
            <div>
              <FieldLabel num={1} label="通貨ペア・銘柄" />
              <select
                value={form.pair}
                onChange={(e) => setForm((prev) => ({ ...prev, pair: e.target.value as PairCode }))}
                className={inputCls}
              >
                {ALL_PAIRS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1.5">
                {isCfd
                  ? `CFD銘柄 — pointsで計算します（1pointサイズ：${pipSize}）`
                  : `FX通貨ペア — pipsで計算します（1pipサイズ：${pipSize}）`}
              </p>
            </div>

            {/* ② 取引方向 */}
            <div>
              <FieldLabel num={2} label="取引方向" />
              <div className="flex gap-3">
                {(["buy", "sell"] as const).map((d) => (
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
              <p className="text-xs text-slate-400 mt-1.5">{directionHint}</p>
            </div>

            {/* ③ エントリー価格 */}
            <div>
              <FieldLabel num={3} label="エントリー価格" />
              <input
                type="number"
                value={form.entryPrice}
                onChange={setNum("entryPrice")}
                step={priceStep}
                min={0}
                className={inputCls}
              />
            </div>

            {/* ④ 利確価格 (TP) */}
            <div>
              <FieldLabel num={4} label="利確価格（テイクプロフィット）" />
              <input
                type="number"
                value={form.takeProfitPrice}
                onChange={setNum("takeProfitPrice")}
                step={priceStep}
                min={0}
                className={inputCls}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {form.direction === "buy" ? "買いの場合はエントリー価格より高い価格を入力" : "売りの場合はエントリー価格より低い価格を入力"}
              </p>
            </div>

            {/* ⑤ ストップロス価格 (SL) */}
            <div>
              <FieldLabel num={5} label="ストップロス価格（損切り）" />
              <input
                type="number"
                value={form.stopLossPrice}
                onChange={setNum("stopLossPrice")}
                step={priceStep}
                min={0}
                className={inputCls}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {form.direction === "buy" ? "買いの場合はエントリー価格より低い価格を入力" : "売りの場合はエントリー価格より高い価格を入力"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Scale className="w-4 h-4" />
              リスクリワードを確認する
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
                {/* RR ratio — big display */}
                <div className="bg-brand-600 rounded-xl p-4 text-center mb-4">
                  <p className="text-xs text-brand-100 mb-1">リスクリワード比率</p>
                  <p className="text-3xl font-extrabold text-white tabular-nums leading-none">
                    1 : {result.rrRatio.toFixed(1)}
                  </p>
                  <p className="text-xs text-brand-200 mt-2">
                    損益分岐勝率：{result.breakEvenWinRate}%
                  </p>
                </div>

                {/* Sub-metrics */}
                <div className="space-y-2.5">
                  <ResultRow
                    label="想定利益幅"
                    value={`${result.profitPips.toFixed(1)} ${unit}`}
                    highlight
                  />
                  <ResultRow
                    label="想定損失幅"
                    value={`${result.lossPips.toFixed(1)} ${unit}`}
                  />
                  <ResultRow
                    label="取引方向"
                    value={form.direction === "buy" ? "買い（Long）" : "売り（Short）"}
                  />
                  <ResultRow label="通貨ペア・銘柄" value={form.pair} />
                </div>

                {/* Inline formula */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">計算式</p>
                  <p className="text-xs font-mono text-slate-700">
                    {result.profitPips.toFixed(1)} ÷ {result.lossPips.toFixed(1)} = <strong className="text-brand-700">1 : {result.rrRatio.toFixed(2)}</strong>
                  </p>
                </div>

                {/* CFD warning */}
                {isCfd && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      CFD銘柄の損益単位はブローカーや口座タイプによって異なる場合があります。
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
              リスクリワード比率は損切り幅に対する利確幅の目安です。<br className="hidden sm:block" />
              勝率や約定条件を保証するものではありません。
            </p>
          </div>

          {/* Funded7 Square Banner */}
          <div className="relative banner-hover-lift">
            <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
            <a
              href="https://my.funded7.com/ja/sign-up?affiliateId=MogusaFX"
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick("Funded7", "https://my.funded7.com/ja/sign-up?affiliateId=MogusaFX")}
              className="block rounded-xl overflow-hidden border border-slate-100"
            >
              <Image src="/images/affiliates/funded7_square.png" alt="Funded7" width={500} height={500} className="w-full h-auto" />
            </a>
          </div>

          {/* Quick reference card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-600 mb-3">損益分岐勝率の目安</p>
            <div className="space-y-2">
              {[
                { rr: "1 : 1.0", winRate: "50.0%" },
                { rr: "1 : 1.5", winRate: "40.0%" },
                { rr: "1 : 2.0", winRate: "33.3%" },
                { rr: "1 : 3.0", winRate: "25.0%" },
              ].map((row) => (
                <div key={row.rr} className={`flex justify-between items-center px-3 py-1.5 rounded-lg text-xs ${
                  result.isValid && Math.abs(parseFloat(row.rr.split(":")[1].trim()) - result.rrRatio) < 0.1
                    ? "bg-brand-50 border border-brand-100 text-brand-700 font-semibold"
                    : "text-slate-500"
                }`}>
                  <span>{row.rr}</span>
                  <span>{row.winRate}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ※ この勝率を下回ると期待値がマイナスになります
            </p>
          </div>
        </div>
      </div>

      {/* ── 計算式の考え方 ──────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-5">計算式の考え方</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 mb-2">① 基本の計算式</p>
            <p className="font-mono text-sm font-bold text-slate-800 mb-3">
              RR比 = 想定利益幅 ÷ 想定損失幅
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>想定利益幅：利確価格とエントリー価格の差をpipsで表した値</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>想定損失幅：エントリー価格とSL価格の差をpipsで表した値</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>RR比1:2の場合、1pips損切る可能性に対して2pips取る計画を意味します</li>
            </ul>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 mb-2">② 損益分岐勝率</p>
            <p className="font-mono text-sm font-bold text-slate-800 mb-3">
              損益分岐勝率 = 1 ÷ (1 + RR比) × 100
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>この勝率を下回ると、同じRR比では長期的に損失が累積します</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>RR比1:2なら損益分岐勝率は33.3%です</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>高いRR比は損益分岐勝率を下げますが、勝率の確保が必要です</li>
            </ul>
          </div>
        </div>

        {/* 計算例 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">計算例（USDJPY 買い）</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <p className="text-slate-500">入力条件</p>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>エントリー価格：150.000</li>
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>利確価格：150.500（+50pips）</li>
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>SL価格：149.750（−25pips）</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-500">計算の流れ</p>
              <ul className="space-y-1 font-mono">
                <li>想定利益幅 = 0.500 ÷ 0.01 = 50 pips</li>
                <li>想定損失幅 = 0.250 ÷ 0.01 = 25 pips</li>
                <li>RR比 = 50 ÷ 25 = <strong className="text-brand-700">1 : 2.0</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* 方向別の計算式 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
            <p className="font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />買い（Long）の場合
            </p>
            <ul className="space-y-1.5 font-mono">
              <li>利益幅 = 利確価格 − エントリー価格</li>
              <li>損失幅 = エントリー価格 − SL価格</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-800">
            <p className="font-semibold text-red-900 mb-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />売り（Short）の場合
            </p>
            <ul className="space-y-1.5 font-mono">
              <li>利益幅 = エントリー価格 − 利確価格</li>
              <li>損失幅 = SL価格 − エントリー価格</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 使い方 ───────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-5">使い方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "通貨ペア・銘柄を選ぶ",
              desc: "FX通貨ペアまたはCFD銘柄（XAUUSD・BTCUSD・JP225など）を選択します。選択内容に応じてpipsまたはpointsで計算します。",
            },
            {
              step: 2,
              icon: <Scale className="w-5 h-5 text-brand-600" />,
              title: "買い・売りを選ぶ",
              desc: "取引方向を選択します。方向によって利益幅と損失幅の計算式が変わります。",
            },
            {
              step: 3,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "エントリー価格を入力する",
              desc: "取引を開始する予定の価格を入力します。チャート上の価格をそのまま入力できます。",
            },
            {
              step: 4,
              icon: <TrendingUp className="w-5 h-5 text-brand-600" />,
              title: "利確価格を入力する",
              desc: "テイクプロフィット（TP）価格を入力します。買いなら上方向、売りなら下方向の価格を設定してください。",
            },
            {
              step: 5,
              icon: <TrendingDown className="w-5 h-5 text-brand-600" />,
              title: "ストップロス価格を入力する",
              desc: "損切り（SL）価格を入力します。買いなら下方向、売りなら上方向の価格を設定してください。",
            },
            {
              step: 6,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "リスクリワード比率を確認する",
              desc: "入力した価格からRR比・想定利益幅・想定損失幅・損益分岐勝率をリアルタイムで確認できます。",
            },
            {
              step: 7,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "トレード日誌に記録する",
              desc: "計算結果をトレード日誌に記録して、エントリー条件を振り返る際の参考データとして活用できます。",
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

      {/* Fintokei Wide Banner */}
      <div className="relative mb-10 banner-hover-lift">
        <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
        <a
          href="https://www.fintokei.com/jp/?affiliate=987"
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackAffiliateClick("Fintokei", "https://www.fintokei.com/jp/?affiliate=987")}
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/fintokei_banner.png" alt="Fintokei" width={1200} height={210} className="w-full h-auto" />
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
      <AffiliateSection itemIds={TOOL_AFFILIATE_MAP["risk-reward-calculator"] ?? []} />

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">よくある質問（FAQ）</h2>
        <FAQSection items={FAQ_ITEMS} />
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            このツールは記録・計算支援を目的としたものであり、売買判断・投資助言・利益保証を目的としたものではありません。実際の取引条件はご利用の取引環境で必ず確認してください。
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
