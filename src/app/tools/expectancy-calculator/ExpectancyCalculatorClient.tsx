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
  Minus,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import AffiliateSection from "@/components/AffiliateSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { TOOL_AFFILIATE_MAP } from "@/data/affiliateItems";
import { calculateExpectancy, type InputMode, type Verdict } from "@/lib/calculations/expectancy";
import { trackToolCalculate, trackRelatedToolClick, trackAffiliateClick } from "@/lib/analytics";
import type { ArticleMeta } from "@/types/article";

// ─── Types ───────────────────────────────────────────────────────────────────

type CurrencyUnit = "JPY" | "USD";

interface FormState {
  mode: InputMode;
  currency: CurrencyUnit;
  winRate: number;
  avgProfit: number;
  avgLoss: number;
  tradeCount: number;
  useTradeCount: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MODE_LABELS: Record<InputMode, string> = {
  amount: "金額で計算",
  r:      "R倍数で計算",
  pips:   "pipsで計算",
};

const PROFIT_LABELS: Record<InputMode, string> = {
  amount: "平均利益額",
  r:      "平均利益R",
  pips:   "平均利益pips",
};

const LOSS_LABELS: Record<InputMode, string> = {
  amount: "平均損失額",
  r:      "平均損失R",
  pips:   "平均損失pips",
};

const UNIT_SUFFIX: (mode: InputMode, currency: CurrencyUnit) => string = (mode, currency) => {
  if (mode === "amount") return currency === "JPY" ? "円" : "USD";
  if (mode === "r")      return "R";
  return "pips";
};

// デフォルト: 勝率45%, 平均利益20,000円, 平均損失10,000円 → 期待値+3,500円
const DEFAULT_FORM: FormState = {
  mode: "amount",
  currency: "JPY",
  winRate: 45,
  avgProfit: 20000,
  avgLoss: 10000,
  tradeCount: 100,
  useTradeCount: true,
};

// ─── Static data ─────────────────────────────────────────────────────────────

interface RelatedTool { title: string; description: string; href: string; icon: string }

const RELATED_TOOLS: RelatedTool[] = [
  { title: "損益計算ツール",             description: "通貨ペア・銘柄、ロット数、値幅から想定損益を計算できます",                href: "/tools/profit-loss-calculator",    icon: "💵" },
  { title: "ロット計算ツール",           description: "口座資金、許容リスク、損切り幅からロット数を計算できます",                 href: "/tools/lot-calculator",            icon: "🧮" },
  { title: "リスクリワード計算ツール",   description: "エントリー価格、利確価格、SL価格からRR比率を確認できます",               href: "/tools/risk-reward-calculator",    icon: "⚖️" },
  { title: "pips計算ツール",             description: "エントリー価格と決済価格から値幅をpipsまたはpointsで確認できます",        href: "/tools/pips-calculator",           icon: "📐" },
];

const COMMON_MISTAKES = [
  {
    title: "勝率だけで判断する",
    desc: "勝率が高くても、平均損失が平均利益より大きい場合、期待値はマイナスになることがあります。勝率と損益比をセットで確認してください。",
  },
  {
    title: "平均損失をマイナスで入力する",
    desc: "このツールでは、平均損失は正の数として入力します。マイナスで入力するとエラーが表示されます。",
  },
  {
    title: "サンプル数が少ないまま判断する",
    desc: "数回の取引だけでは期待値が安定しない場合があります。できるだけ一貫したルールで記録したデータをもとに確認することが重要です。",
  },
  {
    title: "最大損失や連敗を考慮しない",
    desc: "期待値がプラスでも、連敗や一時的なドローダウンが発生する可能性があります。資金管理と合わせて検討することが重要です。",
  },
  {
    title: "手数料やスプレッドを無視する",
    desc: "実際の成績では、手数料、スプレッド、スリッページなども損益に影響します。計算結果はあくまで参考値です。",
  },
  {
    title: "計算結果を利益保証として受け取る",
    desc: "期待値は過去データや仮定条件に基づく計算結果です。将来の成績や利益を保証するものではありません。",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "期待値とは何ですか？",
    answer:
      "期待値とは、1回の取引あたりに平均してどれくらいの損益が見込まれるかを表す計算上の目安です。\n\n勝率、平均利益、平均損失を使って計算します。\n\n期待値 = 勝率 × 平均利益 − 敗率 × 平均損失",
  },
  {
    question: "勝率が高ければ期待値も高くなりますか？",
    answer:
      "必ずしもそうではありません。\n\n勝率が高くても、平均損失が平均利益より大きい場合、期待値がマイナスになることがあります。\n\n逆に、勝率が低くても、平均利益が平均損失より十分に大きければ期待値がプラスになる場合があります。",
  },
  {
    question: "期待値がプラスなら勝てますか？",
    answer:
      "期待値がプラスでも、将来の利益を保証するものではありません。\n\n取引回数、相場環境、スプレッド、手数料、ルール遵守などによって実際の結果は変わります。\n\nこのツールは記録・計算・検証支援を目的とした参考ツールです。",
  },
  {
    question: "R倍数でも計算できますか？",
    answer:
      "はい、R倍数でも計算できます。\n\n入力モードで「R倍数で計算」を選び、平均利益Rと平均損失Rを入力することで、1回あたりの期待値をR単位で確認できます。\n\nたとえば平均利益2R、平均損失1Rの場合、勝率45%での期待値は0.35Rになります。",
  },
  {
    question: "pipsでも計算できますか？",
    answer:
      "はい、pipsでも計算できます。\n\n入力モードで「pipsで計算」を選び、平均利益pipsと平均損失pipsを入力することで、1回あたりの期待値をpips単位で確認できます。",
  },
  {
    question: "平均損失はマイナスで入力しますか？",
    answer:
      "いいえ。平均損失はマイナスではなく、正の数で入力してください。\n\nたとえば平均損失が10,000円の場合は「10000」と入力します。計算式の中で自動的に損失として扱います。",
  },
  {
    question: "何回分のデータで計算すればよいですか？",
    answer:
      "少ない取引回数では期待値が大きくぶれる場合があります。\n\n具体的な回数を推奨するものではありませんが、できるだけ一貫したルールで記録したデータを使うことが重要です。\n\n「バックテスト サンプルサイズ計算ツール」でも統計的な信頼性の目安を確認できます。",
  },
  {
    question: "このツールの結果で売買判断してよいですか？",
    answer:
      "このツールは記録・計算・検証支援を目的とした参考ツールです。\n\n売買判断・投資助言・利益保証を目的としたものではありません。\n\n実際の取引判断は、ご自身のトレードルールと責任のもとで行ってください。",
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  relatedArticles: ArticleMeta[];
}

// ─── Verdict config ───────────────────────────────────────────────────────────

function getVerdictStyle(verdict: Verdict): {
  bg: string; text: string; subText: string; label: string; icon: React.ReactNode;
} {
  switch (verdict) {
    case "positive":
      return {
        bg:      "bg-brand-600",
        text:    "text-white",
        subText: "text-brand-100",
        label:   "期待値はプラスです",
        icon:    <TrendingUp className="w-4 h-4" />,
      };
    case "zero":
      return {
        bg:      "bg-slate-500",
        text:    "text-white",
        subText: "text-slate-200",
        label:   "期待値はほぼゼロです",
        icon:    <Minus className="w-4 h-4" />,
      };
    case "negative":
      return {
        bg:      "bg-red-600",
        text:    "text-white",
        subText: "text-red-100",
        label:   "期待値はマイナスです",
        icon:    <TrendingDown className="w-4 h-4" />,
      };
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExpectancyCalculatorClient({ relatedArticles }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const unit    = UNIT_SUFFIX(form.mode, form.currency);
  const isJPY   = form.mode === "amount" && form.currency === "JPY";

  const result = calculateExpectancy({
    winRate:     form.winRate,
    avgProfit:   form.avgProfit,
    avgLoss:     form.avgLoss,
    tradeCount:  form.useTradeCount ? form.tradeCount : undefined,
  });

  // Format numbers for display
  const fmtNum = (n: number, decimals = 2): string => {
    if (isJPY) return Math.round(n).toLocaleString();
    if (form.mode === "r") return n.toFixed(3);
    return n.toFixed(decimals);
  };

  const verdictStyle = result.isValid ? getVerdictStyle(result.verdict) : null;
  const expSign      = result.isValid && result.expectancy > 0 ? "+" : "";
  const totalSign    = result.expectancyTotal !== null && result.expectancyTotal > 0 ? "+" : "";

  function setNum(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
  }

  const reset = () => setForm(DEFAULT_FORM);
  const handleCalculate = () =>
    trackToolCalculate("expectancy-calculator", form as unknown as Record<string, unknown>);

  const inputCls =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "無料ツール", href: "/tools" }, { label: "期待値計算ツール" }]} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mt-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">期待値計算ツール</h1>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          勝率、平均利益、平均損失を入力すると、1回の取引あたりの期待値を自動計算できます。
          トレードルールの検証や、トレード日誌の集計結果を見直す際に活用できます。
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
          <p className="text-xs text-slate-500 mb-6">数値を入力すると、期待値をリアルタイムで計算します。</p>

          <div className="space-y-5">

            {/* ① 入力モード */}
            <div>
              <FieldLabel num={1} label="入力モード" />
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                {(["amount", "r", "pips"] as InputMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setForm((prev) => ({ ...prev, mode: m }))}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                      form.mode === m
                        ? "bg-brand-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* 通貨単位（amount モード時のみ） */}
            {form.mode === "amount" && (
              <div>
                <FieldLabel num={2} label="通貨単位" />
                <div className="flex gap-3">
                  {(["JPY", "USD"] as CurrencyUnit[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((prev) => ({ ...prev, currency: c }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                        form.currency === c
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {c === "JPY" ? "円（JPY）" : "ドル（USD）"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ② 勝率 */}
            <div>
              <FieldLabel num={form.mode === "amount" ? 3 : 2} label="勝率" />
              <div className="relative">
                <input
                  type="number"
                  value={form.winRate}
                  onChange={setNum("winRate")}
                  min={0}
                  max={100}
                  step={0.1}
                  className={`${inputCls} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">%</span>
              </div>
              {result.isValid && (
                <p className="text-xs text-slate-400 mt-1">
                  敗率：{result.lossRatePercent}%
                </p>
              )}
            </div>

            {/* ③ 平均利益 */}
            <div>
              <FieldLabel num={form.mode === "amount" ? 4 : 3} label={PROFIT_LABELS[form.mode]} />
              <div className="relative">
                <input
                  type="number"
                  value={form.avgProfit}
                  onChange={setNum("avgProfit")}
                  min={0}
                  step={form.mode === "amount" ? (isJPY ? 100 : 0.01) : 0.01}
                  className={`${inputCls} pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
              </div>
            </div>

            {/* ④ 平均損失 */}
            <div>
              <FieldLabel num={form.mode === "amount" ? 5 : 4} label={LOSS_LABELS[form.mode]} />
              <div className="relative">
                <input
                  type="number"
                  value={form.avgLoss}
                  onChange={setNum("avgLoss")}
                  min={0}
                  step={form.mode === "amount" ? (isJPY ? 100 : 0.01) : 0.01}
                  className={`${inputCls} pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                マイナスではなく正の数で入力してください
              </p>
              {result.isValid && (
                <p className="text-xs text-slate-400 mt-0.5">
                  平均RR比：1 : {result.rrRatio.toFixed(2)}
                </p>
              )}
            </div>

            {/* ⑤ 想定取引回数（任意） */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="useTradeCount"
                  checked={form.useTradeCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, useTradeCount: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                <label htmlFor="useTradeCount" className="text-sm font-medium text-slate-700 cursor-pointer">
                  期待値合計を計算する（任意）
                </label>
              </div>
              {form.useTradeCount && (
                <>
                  <FieldLabel num={form.mode === "amount" ? 6 : 5} label="想定取引回数" />
                  <div className="relative">
                    <input
                      type="number"
                      value={form.tradeCount}
                      onChange={setNum("tradeCount")}
                      min={1}
                      step={1}
                      className={`${inputCls} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">回</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    指定した回数分の期待値合計を確認できます。
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Calculator className="w-4 h-4" />
              期待値を確認する
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
            ※ リアルタイムで計算されます。手数料・スプレッドは含まれません。
          </p>
        </div>

        {/* ── Result card ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">計算結果</h2>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            {result.isValid && verdictStyle ? (
              <>
                {/* Big expectancy display */}
                <div className={`${verdictStyle.bg} rounded-xl p-4 text-center mb-4`}>
                  <div className={`flex items-center justify-center gap-1.5 mb-1 ${verdictStyle.subText}`}>
                    {verdictStyle.icon}
                    <span className="text-xs font-medium">{verdictStyle.label}</span>
                  </div>
                  <p className={`text-xs mb-2 ${verdictStyle.subText}`}>1回あたりの期待値</p>
                  <p className={`text-3xl font-extrabold tabular-nums leading-none ${verdictStyle.text}`}>
                    {expSign}{fmtNum(result.expectancy)}
                    <span className="text-lg font-bold ml-1">{unit}</span>
                  </p>
                </div>

                {/* Sub-metrics */}
                <div className="space-y-2.5">
                  <ResultRow label="勝率"     value={`${result.winRatePercent}%`}  highlight />
                  <ResultRow label="敗率"     value={`${result.lossRatePercent}%`} />
                  <ResultRow label="平均利益" value={`${fmtNum(form.avgProfit)} ${unit}`} />
                  <ResultRow label="平均損失" value={`${fmtNum(form.avgLoss)} ${unit}`} />
                  <ResultRow label="平均RR比" value={`1 : ${result.rrRatio.toFixed(2)}`} />
                </div>

                {/* Trade count total */}
                {result.expectancyTotal !== null && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">
                      {form.tradeCount}回あたりの期待値合計
                    </p>
                    <p className="text-lg font-bold tabular-nums text-slate-800">
                      {totalSign}{fmtNum(result.expectancyTotal)}<span className="text-sm font-medium ml-1">{unit}</span>
                    </p>
                  </div>
                )}

                {/* Inline formula */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">計算式</p>
                  <p className="text-xs font-mono text-slate-700 break-all">
                    {result.winRatePercent}% × {fmtNum(form.avgProfit)} − {result.lossRatePercent}% × {fmtNum(form.avgLoss)}
                    {" "}= <strong className={result.verdict === "positive" ? "text-brand-700" : result.verdict === "negative" ? "text-red-700" : "text-slate-700"}>
                      {expSign}{fmtNum(result.expectancy)} {unit}
                    </strong>
                  </p>
                </div>
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
              期待値は過去データや仮定条件に基づく計算結果です。<br className="hidden sm:block" />
              将来の成績や利益を保証するものではありません。
            </p>
          </div>

          {/* TradingView Square Banner */}
          <div className="relative banner-hover-lift">
            <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
            <a
              href="https://jp.tradingview.com/?aff_id=156243"
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick("TradingView", "https://jp.tradingview.com/?aff_id=156243")}
              className="block rounded-xl overflow-hidden border border-slate-100"
            >
              <Image src="/images/affiliates/tradingview_square.jpg" alt="TradingView" width={500} height={500} className="w-full h-auto" />
            </a>
          </div>

          {/* Quick reference card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-600 mb-3">期待値の目安（勝率別）</p>
            <div className="space-y-2">
              {[
                { label: "勝率40% · RR1:2.0", ev: "+0.2倍" },
                { label: "勝率45% · RR1:2.0", ev: "+0.35倍" },
                { label: "勝率50% · RR1:1.0", ev: "  ゼロ" },
                { label: "勝率55% · RR1:1.0", ev: "+0.1倍" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-3 py-1.5 rounded-lg text-xs text-slate-500">
                  <span>{row.label}</span>
                  <span className="font-mono font-medium text-slate-700">{row.ev}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ※ 損失額を1とした場合の倍率の目安です
            </p>
          </div>
        </div>
      </div>

      {/* ── 計算式の考え方 ──────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-5">期待値とは</h2>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          期待値とは、1回の取引あたりに平均してどれくらいの損益が見込まれるかを表す計算上の目安です。
          トレードでは、勝率だけを見てもルールの良し悪しは判断できません。勝率が高くても、1回の損失が大きすぎれば期待値はマイナスになることがあります。
          逆に、勝率が低くても、平均利益が平均損失より十分に大きければ期待値がプラスになる場合があります。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 mb-2">基本の計算式</p>
            <p className="font-mono text-sm font-bold text-slate-800 mb-3">
              期待値 = 勝率 × 平均利益 − 敗率 × 平均損失
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>勝率 = 入力した勝率 ÷ 100（小数変換）</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>敗率 = 1 − 勝率</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>期待値がプラスであればルールとしての条件は整っていることになりますが、将来の利益は保証されません</li>
            </ul>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 mb-2">入力モードについて</p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-slate-700">金額：</span>
                円またはUSDで平均損益を入力。一番シンプルな方法です。
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-slate-700">R倍数：</span>
                損切り額を1Rとして、利益・損失をR倍数で表した値を入力。ロット数に依存しない評価に使われます。
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-slate-700">pips：</span>
                FXのpips単位で平均損益を入力。ロット計算前の検討に活用できます。
              </li>
            </ul>
          </div>
        </div>

        {/* 計算例 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">計算例</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <p className="text-slate-500">入力条件</p>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>勝率：45%</li>
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>平均利益：20,000円</li>
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>平均損失：10,000円</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-500">計算の流れ</p>
              <ul className="space-y-1 font-mono">
                <li>勝率 = 0.45、敗率 = 0.55</li>
                <li>= 0.45 × 20,000 − 0.55 × 10,000</li>
                <li>= 9,000 − 5,500</li>
                <li>= <strong className="text-brand-700">+3,500円</strong></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            ただし、期待値はあくまで入力条件に基づく計算結果です。将来の利益や勝率を保証するものではありません。
          </p>
        </div>
      </section>

      {/* ── 使い方 ───────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-5">期待値計算ツールの使い方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              icon: <Calculator className="w-5 h-5 text-brand-600" />,
              title: "入力モードを選ぶ",
              desc: "金額、R倍数、pipsのどれで計算するかを選びます。トレード日誌の記録形式に合わせて選択してください。",
            },
            {
              step: 2,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "勝率を入力する",
              desc: "過去の取引記録や検証結果から、勝率（%）を入力します。",
            },
            {
              step: 3,
              icon: <TrendingUp className="w-5 h-5 text-brand-600" />,
              title: "平均利益を入力する",
              desc: "勝ちトレードの平均利益を選択した単位（円・R・pips）で入力します。",
            },
            {
              step: 4,
              icon: <TrendingDown className="w-5 h-5 text-brand-600" />,
              title: "平均損失を入力する",
              desc: "負けトレードの平均損失を正の数で入力します。マイナスで入力するとエラーが表示されます。",
            },
            {
              step: 5,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "必要に応じて取引回数を入力する",
              desc: "100回、200回など、想定取引回数に対する期待値合計を確認できます。任意入力です。",
            },
            {
              step: 6,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "計算結果を確認する",
              desc: "1回あたりの期待値・勝率・敗率・平均RR比・期待値合計をリアルタイムで確認できます。",
            },
            {
              step: 7,
              icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
              title: "トレード日誌や検証結果と照らし合わせる",
              desc: "計算結果だけで判断せず、取引ルール、リスク管理、サンプル数も合わせて確認してください。",
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

      {/* Vantage Wide Banner */}
      <div className="relative mb-10 banner-hover-lift">
        <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
        <a
          href="https://www.vantagetradings.com/open-live-account/?affid=MTUwMzY0"
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackAffiliateClick("Vantage", "https://www.vantagetradings.com/open-live-account/?affid=MTUwMzY0")}
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/vantage_1.jpg" alt="Vantage" width={1200} height={160} className="w-full h-auto" />
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
      <AffiliateSection itemIds={TOOL_AFFILIATE_MAP["expectancy-calculator"] ?? []} />

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">よくある質問（FAQ）</h2>
        <FAQSection items={FAQ_ITEMS} />
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            このツールは記録・計算・検証支援を目的としたものであり、売買判断・投資助言・利益保証を目的としたものではありません。計算結果は入力値や仮定条件に基づく参考値であり、将来の成績や利益を保証するものではありません。
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
