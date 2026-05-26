"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  BookOpen,
  Calculator,
  TrendingUp,
  FileText,
  BarChart2,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection from "@/components/FAQSection";
import type { FAQItem } from "@/components/FAQSection";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolCategory = "すべて" | "リスク管理" | "記録・日誌" | "検証・分析" | "価格計算";

interface ToolDef {
  title: string;
  description: string;
  longDescription: string;
  href: string;
  icon: string;
  badge?: string;
  category: Exclude<ToolCategory, "すべて">;
  isFeatured?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_TOOLS: ToolDef[] = [
  {
    title: "ロット計算ツール",
    description: "口座資金・許容リスク・損切り幅からロット数を計算します。",
    longDescription:
      "口座残高と許容リスク率、損切り幅（pips/points）から適切なロット数を自動算出。FX全通貨ペアおよびXAUUSD・JP225などのCFD銘柄にも対応。",
    href: "/tools/lot-calculator",
    icon: "🧮",
    badge: "人気",
    category: "リスク管理",
    isFeatured: true,
  },
  {
    title: "リスクリワード計算ツール",
    description: "エントリー価格、利確価格、損切り価格からRR比率を確認します。",
    longDescription:
      "エントリー・利確・損切りの3点を入力するだけでRR比と損益分岐勝率を即計算。買い・売りの両方向に対応。",
    href: "/tools/risk-reward-calculator",
    icon: "⚖️",
    category: "リスク管理",
    isFeatured: true,
  },
  {
    title: "期待値計算ツール",
    description: "勝率、平均利益、平均損失から取引ルールの期待値を計算します。",
    longDescription:
      "取引ルールが数学的に優位かどうかを確認。勝率・平均利益・平均損失から期待値とR単位期待値を算出します。",
    href: "/tools/expectancy-calculator",
    icon: "📊",
    category: "検証・分析",
    isFeatured: true,
  },
  {
    title: "pips計算ツール",
    description: "エントリー価格と決済価格からpipsまたはpointsを計算します。",
    longDescription:
      "エントリー・SL・TP価格を入力してpips幅を即計算。FX全通貨ペアおよびXAUUSD・BTCUSD・JP225などのCFD銘柄に対応。",
    href: "/tools/pips-calculator",
    icon: "📐",
    category: "価格計算",
  },
  {
    title: "損益計算ツール",
    description: "通貨ペア・銘柄、ロット数、値幅から想定損益を計算します。",
    longDescription:
      "FX全通貨ペアおよびXAUUSD・BTCUSD・JP225などのCFD銘柄に対応。直接入力またはエントリー・決済価格から値幅を計算し、口座通貨（JPY/USD）での損益額を算出します。",
    href: "/tools/profit-loss-calculator",
    icon: "💵",
    badge: "NEW",
    category: "価格計算",
  },
  {
    title: "トレード日誌作成ツール",
    description: "取引内容を入力してトレード日誌を作成・ダウンロードできます。",
    longDescription:
      "エントリー価格・SL・TP・エントリー理由・振り返りを入力してトレード日誌を生成。PDF・CSV・テキスト形式で保存できます。",
    href: "/tools/trade-journal-template",
    icon: "📓",
    badge: "NEW",
    category: "記録・日誌",
  },
];

const CATEGORIES: ToolCategory[] = ["すべて", "リスク管理", "記録・日誌", "検証・分析", "価格計算"];

const CATEGORY_META: Record<ToolCategory, { icon: React.ReactNode; color: string }> = {
  "すべて": { icon: <Calculator className="w-3.5 h-3.5" />, color: "bg-slate-100 text-slate-600 border-slate-200" },
  "リスク管理": { icon: <Shield className="w-3.5 h-3.5" />, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "記録・日誌": { icon: <FileText className="w-3.5 h-3.5" />, color: "bg-green-50 text-green-700 border-green-200" },
  "検証・分析": { icon: <BarChart2 className="w-3.5 h-3.5" />, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "価格計算": { icon: <TrendingUp className="w-3.5 h-3.5" />, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function getCategoryCount(cat: ToolCategory) {
  return cat === "すべて" ? ALL_TOOLS.length : ALL_TOOLS.filter((t) => t.category === cat).length;
}

const FEATURED_TOOLS = ALL_TOOLS.filter((t) => t.isFeatured);

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "すべてのツールは無料で使えますか？",
    answer:
      "はい、すべて無料でご利用いただけます。ユーザー登録やログインも不要です。ブラウザ上で動作するため、アプリのインストールも必要ありません。",
  },
  {
    question: "入力したデータはどこかに保存・送信されますか？",
    answer:
      "入力データは外部サーバーに送信・保存されません。すべての計算はブラウザ内で完結します。",
  },
  {
    question: "FX以外の銘柄にも対応していますか？",
    answer:
      "ロット計算ツールはXAUUSD（金）・BTCUSD・JP225・US100・US500などのCFD銘柄にも対応しています。その他のツールについては各ツールのページでご確認ください。",
  },
  {
    question: "計算結果を取引の判断基準として使えますか？",
    answer:
      "各ツールの計算結果は記録・計算支援を目的とした参考値です。売買判断・投資助言・利益保証を目的としたものではありません。実際の取引判断はご自身の責任で行ってください。",
  },
  {
    question: "スマートフォンでも使えますか？",
    answer:
      "はい、スマートフォン・タブレット・PCすべてのデバイスに対応しています。レスポンシブデザインで各画面サイズに最適化されています。",
  },
  {
    question: "計算結果がブローカーの表示と異なることはありますか？",
    answer:
      "あります。ブローカーによって1lotあたりの通貨量、CFD銘柄の1point価値、スプレッド計算方法などが異なる場合があります。このツールは一般的な計算式に基づく補助ツールです。実際の発注前にはご利用の取引環境で必ず確認してください。",
  },
];

// ─── Guide steps ──────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    step: 1,
    icon: "🎯",
    title: "目的に合ったツールを選ぶ",
    desc: "「リスク管理」「記録・日誌」「検証・分析」「価格計算」の4カテゴリから、今の用途に合ったツールをフィルターで絞り込んでください。",
  },
  {
    step: 2,
    icon: "📝",
    title: "数値を入力して計算する",
    desc: "各ツールのフォームに数値を入力するだけで結果が即時表示されます。登録不要・インストール不要で、そのままブラウザで使えます。",
  },
  {
    step: 3,
    icon: "📊",
    title: "記録・振り返りに活用する",
    desc: "計算結果をトレード日誌に記録したり、リスク管理の参考値として活用してください。複数ツールを組み合わせると、より多角的な検証ができます。",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolsClient() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("すべて");

  const filteredTools =
    activeCategory === "すべて"
      ? ALL_TOOLS
      : ALL_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      <Breadcrumbs items={[{ label: "無料ツール一覧" }]} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="mt-5 mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {["全6種類", "無料", "登録不要", "ブラウザで即利用"].map((b) => (
            <span
              key={b}
              className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-100"
            >
              {b}
            </span>
          ))}
        </div>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-bold text-slate-900 leading-tight tracking-tight mb-4">
          無料トレード検証ツール一覧
        </h1>
        <p className="text-[16px] sm:text-[17px] text-slate-600 leading-[1.8] max-w-2xl mb-6">
          ロット計算・リスクリワード・期待値・pips計算など、個人トレーダーの記録・計算・検証を支援する無料ツールを6種類提供しています。
          ブラウザ上で動作し、登録不要でご利用いただけます。
        </p>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-6 text-sm text-slate-500 pt-4 border-t border-slate-100">
          {[
            { value: "6", label: "種類のツール" },
            { value: "0円", label: "すべて無料" },
            { value: "0秒", label: "登録時間" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-brand-600">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── おすすめツール ────────────────────────────────────────────────────── */}
      <section className="mb-12" id="featured">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">よく使われるツール</h2>
          <span className="text-xs text-slate-400">まずはここから</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-300 hover:shadow-lg transition-all"
            >
              {tool.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  {tool.badge}
                </span>
              )}
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl mb-4 shrink-0">
                {tool.icon}
              </div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors mb-2 pr-10">
                {tool.title}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mb-5 flex-1">
                {tool.longDescription}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                ツールを使う
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
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
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/fintokei_banner.png" alt="Fintokei" width={1200} height={210} className="w-full h-auto" priority />
        </a>
      </div>

      {/* ── Category filter + all tools ──────────────────────────────────────── */}
      <section className="mb-14" id="all-tools">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">全ツール一覧</h2>
          <span className="text-xs text-slate-400 tabular-nums">{filteredTools.length}件</span>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-7">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : `bg-white ${meta.color} hover:border-brand-300 hover:text-brand-600`
                }`}
              >
                <span className={isActive ? "text-white" : ""}>{meta.icon}</span>
                {cat}
                <span
                  className={`ml-0.5 text-[10px] font-normal ${
                    isActive ? "text-brand-200" : "text-slate-400"
                  }`}
                >
                  {getCategoryCount(cat)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tool cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const catMeta = CATEGORY_META[tool.category];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Category chip */}
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit mb-2 ${catMeta.color}`}
                >
                  {catMeta.icon}
                  {tool.category}
                </span>

                <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors mb-1.5 leading-snug">
                  {tool.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
                  {tool.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                  ツールを使う
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 使い方ガイド ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-50 to-brand-50 border border-slate-200 rounded-2xl p-6 sm:p-8 mb-12" id="guide">
        <div className="mb-7">
          <h2 className="text-xl font-bold text-slate-900 mb-1">ツールの使い方</h2>
          <p className="text-sm text-slate-500">3ステップで計算・検証を始めましょう。</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {GUIDE_STEPS.map((step, i) => (
            <div key={step.step} className="relative flex flex-col">
              {/* Connector line */}
              {i < GUIDE_STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-4 left-full w-full h-px bg-slate-200 -translate-x-3 z-0" />
              )}
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {step.step}
                </div>
                <span className="text-xl">{step.icon}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1.5">{step.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Notes strip */}
        <div className="pt-5 border-t border-slate-200/70">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />, text: "入力データは外部に送信されません" },
              { icon: <Shield className="w-4 h-4 text-brand-500 shrink-0" />, text: "計算結果は参考値です" },
              { icon: <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />, text: "売買判断・投資助言ではありません" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 bg-white/60 rounded-lg px-3 py-2">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="mb-12" id="faq">
        <h2 className="text-xl font-bold text-slate-900 mb-5">よくある質問</h2>
        <FAQSection items={FAQ_ITEMS} />
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <DisclaimerBox />
    </div>
  );
}
