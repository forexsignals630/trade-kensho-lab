"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  BarChart3,
  Activity,
  Scale,
  Calculator,
  TrendingUp,
  FileText,
  BookOpen,
  Target,
  ClipboardList,
  Lightbulb,
  Printer,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import AffiliateSection from "@/components/AffiliateSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { TOOL_AFFILIATE_MAP } from "@/data/affiliateItems";
import { trackRelatedToolClick, trackToolCalculate, trackAffiliateClick } from "@/lib/analytics";
import type { ArticleMeta } from "@/types/article";

// ─── Types ────────────────────────────────────────────────────────────────────

type Direction = "買い" | "売り";

interface JournalForm {
  date: string;
  pair: string;
  direction: Direction;
  entryPrice: string;
  slPrice: string;
  tpPrice: string;
  lotSize: string;
  entryReason: string;
  exitReason: string;
  result: string;
  ruleCompliance: string;
  emotionMemo: string;
  review: string;
  nextImprovement: string;
  screenshotUrl: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAIR_GROUPS = [
  { label: "メジャーFX",  pairs: ["EURUSD","GBPUSD","USDJPY","USDCHF","USDCAD","AUDUSD","NZDUSD"] },
  { label: "クロス円",    pairs: ["GBPJPY","EURJPY","AUDJPY","NZDJPY","CADJPY","CHFJPY"] },
  { label: "クロス通貨",  pairs: ["EURGBP","EURAUD","EURCAD","EURCHF","EURNZD","GBPAUD","GBPCAD","GBPCHF","GBPNZD","AUDCAD","AUDCHF","AUDNZD","CADCHF","NZDCAD","NZDCHF"] },
  { label: "CFD・その他", pairs: ["XAUUSD","BTCUSD","JP225","US100","US500"] },
];

const BLANK_FORM: JournalForm = {
  date:            "",
  pair:            "USDJPY",
  direction:       "買い",
  entryPrice:      "",
  slPrice:         "",
  tpPrice:         "",
  lotSize:         "",
  entryReason:     "",
  exitReason:      "",
  result:          "",
  ruleCompliance:  "",
  emotionMemo:     "",
  review:          "",
  nextImprovement: "",
  screenshotUrl:   "",
};

const LS_KEY = "trade-journal-form-v1";

// ─── Auto-calculation ─────────────────────────────────────────────────────────

const PIP_MAP: Record<string, { size: number; unit: "pips" | "points" }> = {
  USDJPY: { size: 0.01, unit: "pips" },
  EURJPY: { size: 0.01, unit: "pips" },
  GBPJPY: { size: 0.01, unit: "pips" },
  AUDJPY: { size: 0.01, unit: "pips" },
  CHFJPY: { size: 0.01, unit: "pips" },
  NZDJPY: { size: 0.01, unit: "pips" },
  CADJPY: { size: 0.01, unit: "pips" },
  XAUUSD: { size: 0.01, unit: "points" },
  BTCUSD: { size: 1,    unit: "points" },
  JP225:  { size: 1,    unit: "points" },
  US100:  { size: 1,    unit: "points" },
  US500:  { size: 1,    unit: "points" },
};

function getPipInfo(pair: string): { size: number; unit: "pips" | "points" } {
  return PIP_MAP[pair] ?? { size: 0.0001, unit: "pips" };
}

function fmtW(w: number): string {
  const r = Math.round(w * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
}

interface AutoCalc {
  slWidthStr: string;
  tpWidthStr: string;
  rrStr:      string;
  unit:       "pips" | "points";
}

function calcAuto(f: JournalForm): AutoCalc {
  const { size, unit } = getPipInfo(f.pair);
  const ep = parseFloat(f.entryPrice);
  const sl = parseFloat(f.slPrice);
  const tp = parseFloat(f.tpPrice);
  const hasEntry = !isNaN(ep) && ep > 0;
  const hasSl    = !isNaN(sl) && sl > 0;
  const hasTp    = !isNaN(tp) && tp > 0;

  const slW = hasEntry && hasSl ? Math.abs(ep - sl) / size : null;
  const tpW = hasEntry && hasTp ? Math.abs(tp - ep) / size : null;

  return {
    slWidthStr: slW !== null ? `${fmtW(slW)} ${unit}` : "未計算",
    tpWidthStr: tpW !== null ? `${fmtW(tpW)} ${unit}` : "未計算",
    rrStr:      slW !== null && slW > 0 && tpW !== null
      ? `1 : ${(tpW / slW).toFixed(1)}`
      : "未計算",
    unit,
  };
}

// ─── Content constants ────────────────────────────────────────────────────────

const FIELD_EXPLANATIONS: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <Target className="w-5 h-5 text-brand-600" />,
    title: "エントリー理由",
    desc: "なぜその位置で入ったのかを記録します。後から見返したときに、ルール通りの取引だったかを確認しやすくなります。",
  },
  {
    icon: <Scale className="w-5 h-5 text-brand-600" />,
    title: "ストップロス価格",
    desc: "損切り位置を記録します。損切り幅やロット数と合わせて、リスクを取りすぎていないか確認できます。",
  },
  {
    icon: <Calculator className="w-5 h-5 text-brand-600" />,
    title: "ロット数",
    desc: "実際に取引したロット数を記録します。口座資金に対して適切なリスクだったかを見返す材料になります。",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
    title: "リスクリワード",
    desc: "損切り幅に対して、利確幅がどれくらいあったかを確認するために使います。",
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-brand-600" />,
    title: "ルール遵守",
    desc: "取引ルールを守れたかを ○ / △ / × などで記録します。成績だけでは見えにくい改善点を見つけやすくなります。",
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-brand-600" />,
    title: "振り返り",
    desc: "良かった点、悪かった点、次回改善することを短く記録します。長文でなくても、継続できる形にすることが重要です。",
  },
];

const HOW_TO_STEPS = [
  "日付と通貨ペア・銘柄を入力する",
  "エントリー価格、ストップロス価格、利確価格を入力する",
  "ロット数を入力する（損切り幅・利確幅・リスクリワードは自動計算されます）",
  "エントリー理由と決済理由を記録する",
  "結果、ルール遵守、感情メモ、振り返りを入力する",
  "右側のプレビューを確認する",
  "PDF / CSV / テキスト形式で保存する",
  "必要に応じてGoogleスプレッドシート、Excel、Notionなどで管理する",
];

const TIPS: { title: string; desc: string }[] = [
  {
    title: "最初から完璧に書こうとしない",
    desc: "項目をすべて埋めようとすると負担になります。まずは、エントリー理由・損切り位置・結果・振り返りだけでも十分です。",
  },
  {
    title: "取引直後に短く書く",
    desc: "時間が経つと、判断理由や感情を忘れやすくなります。取引直後に短く記録するのがおすすめです。",
  },
  {
    title: "週末にまとめて見返す",
    desc: "1件ごとの反省だけでなく、週単位でルール違反や負けパターンを確認すると、改善点を見つけやすくなります。",
  },
  {
    title: "勝ちトレードだけでなく負けトレードも残す",
    desc: "負けトレードには改善の材料が多く含まれます。都合の悪い記録を消さないことが重要です。",
  },
  {
    title: "スクリーンショットも残す",
    desc: "チャート画像やTradingViewのURLを残しておくと、後から相場環境を確認しやすくなります。",
  },
];

const RELATED_TOOLS: { label: string; desc: string; href: string; icon: ReactNode }[] = [
  {
    label: "損益計算ツール",
    desc: "通貨ペア・銘柄、ロット数、値幅から想定損益を計算できます。FX・XAUUSD・CFD対応。",
    href: "/tools/profit-loss-calculator",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: "ロット計算ツール",
    desc: "口座資金、許容リスク、損切り幅からロット数を計算できます。",
    href: "/tools/lot-calculator",
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    label: "pips計算ツール",
    desc: "エントリー価格と比較価格から、損切り幅や利確幅をpips / pointsで確認できます。",
    href: "/tools/pips-calculator",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    label: "リスクリワード計算ツール",
    desc: "エントリー価格、利確価格、ストップロス価格からRR比率を確認できます。",
    href: "/tools/risk-reward-calculator",
    icon: <Scale className="w-4 h-4" />,
  },
  {
    label: "期待値計算ツール",
    desc: "勝率、平均利益、平均損失から取引ルールの期待値を計算できます。",
    href: "/tools/expectancy-calculator",
    icon: <BarChart3 className="w-4 h-4" />,
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "作成したトレード日誌はどこに保存されますか？",
    answer:
      "入力内容はサーバーには送信されません。保存したファイルをご自身の端末、Googleスプレッドシート、Excel、Notionなどで管理してください。入力内容はお使いのブラウザ内に一時保存されます。",
  },
  {
    question: "PDF、CSV、テキストの違いは何ですか？",
    answer:
      "PDFは印刷やそのまま保存したい場合に向いています。CSVはGoogleスプレッドシートやExcelで表として管理したい場合に向いています。テキストはメモアプリなどに保存したい場合に便利です。",
  },
  {
    question: "すべての項目を入力する必要がありますか？",
    answer:
      "いいえ。最初からすべて埋める必要はありません。まずは、通貨ペア・銘柄、エントリー理由、ストップロス価格、ロット数、結果、振り返りなど、最低限の項目から始めるのがおすすめです。",
  },
  {
    question: "pipsやロット数が分からない場合はどうすればいいですか？",
    answer:
      "pips計算ツールやロット計算ツールを使うことで、損切り幅やロット数を確認できます。必要に応じて関連ツールを併用してください。",
  },
  {
    question: "Markdown形式は使えますか？",
    answer:
      "クリップボードコピー機能からテキスト形式でコピーできます。NotionやObsidianにはそのまま貼り付けて整形することも可能です。一般的にはPDF・CSV・テキスト形式の方が扱いやすいため、本ツールではそれらを主な保存形式としています。",
  },
  {
    question: "PDFで保存するにはどうすればいいですか？",
    answer:
      "「PDFで保存」ボタンをクリックすると、ブラウザの印刷ダイアログが開きます。印刷先として「PDFに保存」または「Microsoft Print to PDF」などを選択すると、PDFファイルとして保存できます。",
  },
  {
    question: "入力内容は外部に送信されますか？",
    answer:
      "送信されません。このツールはブラウザ上で日誌を生成し、保存する仕組みです。サーバー保存は行いません。",
  },
  {
    question: "トレード日誌をつければ勝てるようになりますか？",
    answer:
      "トレード日誌は売買判断や利益を保証するものではありません。ただし、自分の取引傾向や改善点を把握するための材料になります。",
  },
  {
    question: "入力項目は自分用に変更してもいいですか？",
    answer:
      "はい。保存後に、ご自身の取引スタイルや検証したい内容に合わせて項目を追加・削除して使ってください。",
  },
];

// ─── Content generators ───────────────────────────────────────────────────────

function dv(val: string, suffix = ""): string {
  const t = val.trim();
  if (!t) return "未入力";
  return suffix ? `${t}${suffix}` : t;
}

function generateText(f: JournalForm): string {
  const hr = "─".repeat(32);
  const c = calcAuto(f);
  return `【トレード日誌】
${hr}
■ 基本情報
日付：${dv(f.date)}
通貨ペア・銘柄：${dv(f.pair)}
取引方向：${dv(f.direction)}

■ 価格・リスク管理
エントリー価格：${dv(f.entryPrice)}
ストップロス価格：${dv(f.slPrice)}
利確価格：${dv(f.tpPrice)}
損切り幅：${c.slWidthStr}
利確幅：${c.tpWidthStr}
ロット数：${dv(f.lotSize, " lot")}
リスクリワード：${c.rrStr}

■ 取引理由
エントリー理由：${dv(f.entryReason)}
決済理由：${dv(f.exitReason)}

■ 結果
結果：${dv(f.result)}
ルール遵守：${dv(f.ruleCompliance)}

■ 振り返り
感情メモ：${dv(f.emotionMemo)}
振り返り：${dv(f.review)}
次回の改善点：${dv(f.nextImprovement)}

■ 補足
スクリーンショットURL / メモ：${dv(f.screenshotUrl)}
`;
}

function generateCSV(f: JournalForm): string {
  const BOM = "﻿";
  const c = calcAuto(f);
  const headers =
    "日付,通貨ペア・銘柄,取引方向,エントリー価格,ストップロス価格,利確価格,損切り幅,利確幅,ロット数,リスクリワード,エントリー理由,決済理由,結果,ルール遵守,感情メモ,振り返り,次回の改善点,スクリーンショットURL・メモ";
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const row = [
    f.date, f.pair, f.direction,
    f.entryPrice, f.slPrice, f.tpPrice,
    c.slWidthStr, c.tpWidthStr, f.lotSize, c.rrStr,
    f.entryReason, f.exitReason, f.result,
    f.ruleCompliance, f.emotionMemo, f.review,
    f.nextImprovement, f.screenshotUrl,
  ].map(q).join(",");
  return BOM + headers + "\n" + row;
}

function generatePrintHtml(f: JournalForm): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

  const c = calcAuto(f);

  const dataRow = (label: string, value: string, suffix = ""): string => {
    const trimmed = value.trim();
    const display = trimmed
      ? `<span class="value">${esc(trimmed)}${suffix ? ` ${esc(suffix)}` : ""}</span>`
      : `<span class="value empty">未入力</span>`;
    return `<div class="row"><span class="label">${esc(label)}</span>${display}</div>`;
  };

  const calcRow = (label: string, value: string): string => {
    const isUnknown = value === "未計算";
    return `<div class="row"><span class="label">${esc(label)}</span><span class="value${isUnknown ? " empty" : ""}">${esc(value)}</span></div>`;
  };

  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>トレード日誌 ${esc(f.date || "日付未設定")}</title>
<style>
  @page { size: A4 portrait; margin: 18mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
    font-size: 10.5pt; color: #111; background: #fff; line-height: 1.65;
  }
  h1 { font-size: 17pt; font-weight: bold; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: 4px; }
  .subtitle { font-size: 9.5pt; color: #555; margin-bottom: 18px; }
  .section { margin-bottom: 14px; break-inside: avoid; }
  .section-title {
    font-size: 9.5pt; font-weight: bold; color: #1d4ed8;
    background: #eff6ff; padding: 3px 8px;
    border-left: 3px solid #2563eb; margin-bottom: 6px;
  }
  .row { display: flex; align-items: flex-start; gap: 8px; padding: 3.5px 8px; border-bottom: 1px solid #f0f0f0; }
  .row:last-child { border-bottom: none; }
  .label { font-size: 9pt; color: #555; white-space: nowrap; min-width: 140px; flex-shrink: 0; padding-top: 1px; }
  .value { font-size: 10pt; color: #111; flex: 1; word-break: break-word; }
  .value.empty { color: #bbb; font-style: italic; }
  .footer { margin-top: 22px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 8pt; color: #999; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<h1>📓 トレード日誌</h1>
<p class="subtitle">${esc(f.date || "日付未設定")} &nbsp;·&nbsp; ${esc(f.pair)} &nbsp;·&nbsp; ${esc(f.direction)}</p>

<div class="section">
  <div class="section-title">基本情報</div>
  ${dataRow("日付", f.date)}
  ${dataRow("通貨ペア・銘柄", f.pair)}
  ${dataRow("取引方向", f.direction)}
</div>

<div class="section">
  <div class="section-title">価格・リスク管理</div>
  ${dataRow("エントリー価格", f.entryPrice)}
  ${dataRow("ストップロス価格", f.slPrice)}
  ${dataRow("利確価格", f.tpPrice)}
  ${calcRow("損切り幅", c.slWidthStr)}
  ${calcRow("利確幅", c.tpWidthStr)}
  ${dataRow("ロット数", f.lotSize, f.lotSize.trim() ? "lot" : "")}
  ${calcRow("リスクリワード", c.rrStr)}
</div>

<div class="section">
  <div class="section-title">取引理由</div>
  ${dataRow("エントリー理由", f.entryReason)}
  ${dataRow("決済理由", f.exitReason)}
</div>

<div class="section">
  <div class="section-title">結果</div>
  ${dataRow("結果", f.result)}
  ${dataRow("ルール遵守", f.ruleCompliance)}
</div>

<div class="section">
  <div class="section-title">振り返り</div>
  ${dataRow("感情メモ", f.emotionMemo)}
  ${dataRow("振り返り", f.review)}
  ${dataRow("次回の改善点", f.nextImprovement)}
</div>

<div class="section">
  <div class="section-title">補足</div>
  ${dataRow("スクリーンショットURL / メモ", f.screenshotUrl)}
</div>

<div class="footer">作成日：${today}</div>
</body>
</html>`;
}

function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function FL({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

function FieldHint({ href, label }: { href: string; label: string }) {
  return (
    <p className="mt-1.5 text-xs text-slate-400">
      <Link
        href={href}
        className="text-brand-500 hover:text-brand-600 hover:underline transition-colors"
      >
        → {label}
      </Link>
    </p>
  );
}

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors " +
  "placeholder:text-slate-300";

const textareaCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors " +
  "placeholder:text-slate-300 resize-none leading-relaxed";

// Preview sub-components

function PSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="block w-0.5 h-3.5 bg-brand-500 rounded-full shrink-0" />
        <p className="text-xs font-bold text-brand-700 tracking-wide">{title}</p>
      </div>
      <div className="pl-3 space-y-1.5">{children}</div>
    </div>
  );
}

function PRow({ label, value }: { label: string; value: string }) {
  const empty = !value.trim();
  return (
    <div className="flex items-start gap-1 text-xs">
      <span className="text-slate-400 shrink-0 leading-relaxed">-</span>
      <span className="text-slate-500 shrink-0 leading-relaxed whitespace-nowrap">{label}：</span>
      <span className={`leading-relaxed break-words min-w-0 ${empty ? "text-slate-300 italic" : "text-slate-700"}`}>
        {empty
          ? "未入力"
          : value.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  relatedArticles: ArticleMeta[];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TradeJournalTemplateClient({ relatedArticles }: Props) {
  const [form, setForm] = useState<JournalForm>(BLANK_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── mount: restore localStorage ──────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<JournalForm>;
        setForm({ ...BLANK_FORM, ...parsed });
      } else {
        setForm((p) => ({ ...p, date: today }));
      }
    } catch {
      setForm((p) => ({ ...p, date: today }));
    }
    setHydrated(true);
  }, []);

  // ── persist on change ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(form));
    } catch {
      // quota exceeded — silently ignore
    }
  }, [form, hydrated]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const set = useCallback(
    <K extends keyof JournalForm>(key: K, val: JournalForm[K]) =>
      setForm((p) => ({ ...p, [key]: val })),
    []
  );

  const handleClear = useCallback(() => {
    if (!window.confirm("入力内容をすべてクリアしますか？この操作は取り消せません。")) return;
    const today = new Date().toISOString().split("T")[0];
    setForm({ ...BLANK_FORM, date: today });
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generateText(form)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [form]);

  const fname = `trade-journal-${form.date || "draft"}`;

  const handlePdf = useCallback(() => {
    trackToolCalculate("trade-journal-template", { format: "pdf" });
    const win = window.open("", "_blank", "width=820,height=960");
    if (!win) {
      alert("ポップアップがブロックされました。ブラウザのポップアップ許可設定を確認してから再度お試しください。");
      return;
    }
    win.document.write(generatePrintHtml(form));
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
  }, [form]);

  const handleDlTxt = useCallback(() => {
    trackToolCalculate("trade-journal-template", { format: "text" });
    triggerDownload(generateText(form), `${fname}.txt`, "text/plain;charset=utf-8");
  }, [form, fname]);

  const handleDlCsv = useCallback(() => {
    trackToolCalculate("trade-journal-template", { format: "csv" });
    triggerDownload(generateCSV(form), `${fname}.csv`, "text/csv;charset=utf-8");
  }, [form, fname]);

  // ── derived: auto-calc (recomputed on every render — cheap) ──────────────
  const calc = calcAuto(form);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "ツール一覧", href: "/tools" },
            { label: "トレード日誌作成ツール" },
          ]}
        />

        {/* Hero */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-3 py-1">
              無料ツール
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            トレード日誌作成ツール
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
            通貨ペア・銘柄、エントリー価格、ストップロス価格、ロット数、エントリー理由、結果、振り返りを入力すると、トレード日誌を自動生成できます。
            作成した日誌は、PDF・CSV・テキスト形式で保存でき、Googleスプレッドシート、Excel、Notion、メモアプリなどで管理できます。
          </p>
          <AffiliateDisclosure className="mt-3" />
          <DisclaimerBox variant="tool" />
        </div>

        {/* localStorage notice */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          <span className="text-base shrink-0">💾</span>
          <p>入力内容はお使いのブラウザ内に一時保存されます。サーバーには送信されません。</p>
        </div>

        {/* ══ 2-column: Form | Preview ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ─ Left: Form ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* 基本情報 */}
            <FormSection title="基本情報">
              <div>
                <FL htmlFor="date">日付</FL>
                <input
                  type="date"
                  id="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <FL htmlFor="pair">通貨ペア・銘柄</FL>
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
              <div>
                <FL htmlFor="dir-buy">取引方向</FL>
                <div className="flex gap-2">
                  {(["買い", "売り"] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      id={dir === "買い" ? "dir-buy" : "dir-sell"}
                      onClick={() => set("direction", dir)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                        form.direction === dir
                          ? dir === "買い"
                            ? "bg-brand-600 text-white border-brand-600"
                            : "bg-red-500 text-white border-red-500"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {dir === "買い" ? "▲ 買い" : "▼ 売り"}
                    </button>
                  ))}
                </div>
              </div>
            </FormSection>

            {/* 価格・リスク管理 */}
            <FormSection title="価格・リスク管理">
              <div>
                <FL htmlFor="entryPrice">エントリー価格</FL>
                <input type="number" id="entryPrice" step="any"
                  value={form.entryPrice}
                  onChange={(e) => set("entryPrice", e.target.value)}
                  className={inputCls} placeholder="例 150.250"
                />
              </div>
              <div>
                <FL htmlFor="slPrice">ストップロス価格</FL>
                <input type="number" id="slPrice" step="any"
                  value={form.slPrice}
                  onChange={(e) => set("slPrice", e.target.value)}
                  className={inputCls} placeholder="例 149.750"
                />
              </div>
              <div>
                <FL htmlFor="tpPrice">利確価格</FL>
                <input type="number" id="tpPrice" step="any"
                  value={form.tpPrice}
                  onChange={(e) => set("tpPrice", e.target.value)}
                  className={inputCls} placeholder="例 150.750"
                />
              </div>
              <div>
                <FL htmlFor="lotSize">ロット数</FL>
                <input type="number" id="lotSize" step="any"
                  value={form.lotSize}
                  onChange={(e) => set("lotSize", e.target.value)}
                  className={inputCls} placeholder="例 0.40"
                />
                <FieldHint
                  href="/tools/lot-calculator"
                  label="ロット数が分からない場合はロット計算ツールを使う"
                />
              </div>
            </FormSection>

            {/* 自動計算カード */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-700">自動計算</span>
                <span className="text-xs text-brand-400">エントリー・SL・TP価格から算出</span>
              </div>
              <div className="space-y-2">
                {(
                  [
                    { label: "損切り幅",       value: calc.slWidthStr },
                    { label: "利確幅",         value: calc.tpWidthStr },
                    { label: "リスクリワード", value: calc.rrStr },
                  ] as const
                ).map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${
                      value === "未計算" ? "text-slate-300" : "text-slate-800"
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-brand-100">
                損切り幅・利確幅・リスクリワードは、入力された価格差から自動計算されます。実際の取引条件、スプレッド、手数料、スリッページなどは考慮していません。
              </p>
              <p className="text-xs text-slate-400">
                より詳しく確認したい場合は、
                <Link href="/tools/pips-calculator" className="text-brand-500 hover:text-brand-600 hover:underline">pips計算ツール</Link>
                や
                <Link href="/tools/risk-reward-calculator" className="text-brand-500 hover:text-brand-600 hover:underline">リスクリワード計算ツール</Link>
                も利用できます。
              </p>
            </div>

            {/* 取引理由 */}
            <FormSection title="取引理由">
              <div>
                <FL htmlFor="entryReason">エントリー理由</FL>
                <textarea id="entryReason" rows={3}
                  value={form.entryReason}
                  onChange={(e) => set("entryReason", e.target.value)}
                  className={textareaCls}
                  placeholder="例：上位足の押し目、直近サポート反発を確認"
                />
              </div>
              <div>
                <FL htmlFor="exitReason">決済理由</FL>
                <textarea id="exitReason" rows={3}
                  value={form.exitReason}
                  onChange={(e) => set("exitReason", e.target.value)}
                  className={textareaCls}
                  placeholder="例：利確価格に到達 / 損切り / 手動撤退"
                />
              </div>
            </FormSection>

            {/* 結果 */}
            <FormSection title="結果">
              <div>
                <FL htmlFor="result">結果</FL>
                <input type="text" id="result"
                  value={form.result}
                  onChange={(e) => set("result", e.target.value)}
                  className={inputCls}
                  placeholder="例：+50pips / +2R / -1R"
                />
              </div>
              <div>
                <FL htmlFor="ruleCompliance">ルール遵守</FL>
                <select id="ruleCompliance"
                  value={form.ruleCompliance}
                  onChange={(e) => set("ruleCompliance", e.target.value)}
                  className={inputCls}
                >
                  <option value="">未選択</option>
                  <option value="○ 守れた">○ 守れた</option>
                  <option value="△ 一部守れなかった">△ 一部守れなかった</option>
                  <option value="× 守れなかった">× 守れなかった</option>
                </select>
              </div>
            </FormSection>

            {/* 振り返り */}
            <FormSection title="振り返り">
              <div>
                <FL htmlFor="emotionMemo">感情メモ</FL>
                <textarea id="emotionMemo" rows={3}
                  value={form.emotionMemo}
                  onChange={(e) => set("emotionMemo", e.target.value)}
                  className={textareaCls}
                  placeholder="例：エントリー後に不安があったが、損切り位置は変更しなかった"
                />
              </div>
              <div>
                <FL htmlFor="review">振り返り</FL>
                <textarea id="review" rows={4}
                  value={form.review}
                  onChange={(e) => set("review", e.target.value)}
                  className={textareaCls}
                  placeholder="例：エントリー根拠は明確だったが、入るタイミングが少し早かった"
                />
              </div>
              <div>
                <FL htmlFor="nextImprovement">次回の改善点</FL>
                <textarea id="nextImprovement" rows={3}
                  value={form.nextImprovement}
                  onChange={(e) => set("nextImprovement", e.target.value)}
                  className={textareaCls}
                  placeholder="例：次回は利確位置まで決めてからエントリーする"
                />
              </div>
            </FormSection>

            {/* 任意 */}
            <FormSection title="補足（任意）">
              <div>
                <FL htmlFor="screenshotUrl">スクリーンショットURL / メモ</FL>
                <input type="text" id="screenshotUrl"
                  value={form.screenshotUrl}
                  onChange={(e) => set("screenshotUrl", e.target.value)}
                  className={inputCls}
                  placeholder="例：TradingViewのチャートURL、画像ファイル名など"
                />
              </div>
            </FormSection>

            {/* Clear */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 border border-slate-200 rounded-lg hover:text-slate-600 hover:border-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                入力内容をクリア
              </button>
            </div>
          </div>

          {/* ─ Right: Preview + Downloads ─────────────────────────────────── */}
          <div className="lg:sticky lg:top-4 lg:self-start space-y-4">

            {/* Preview card */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-slate-700">生成されたトレード日誌</span>
                </div>
                <span className="text-xs text-slate-400">リアルタイム更新</span>
              </div>

              {/* scrollable body */}
              <div className="bg-white p-5 max-h-[60vh] overflow-y-auto space-y-5">
                {/* doc title */}
                <div className="pb-3 border-b border-slate-100">
                  <p className="text-base font-bold text-slate-900">📓 トレード日誌</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {form.date || "日付未設定"} · {form.pair} · {form.direction}
                  </p>
                </div>

                <PSection title="基本情報">
                  <PRow label="日付"           value={form.date} />
                  <PRow label="通貨ペア・銘柄" value={form.pair} />
                  <PRow label="取引方向"       value={form.direction} />
                </PSection>

                <PSection title="価格・リスク管理">
                  <PRow label="エントリー価格"   value={form.entryPrice} />
                  <PRow label="ストップロス価格" value={form.slPrice} />
                  <PRow label="利確価格"         value={form.tpPrice} />
                  <PRow label="損切り幅"         value={calc.slWidthStr} />
                  <PRow label="利確幅"           value={calc.tpWidthStr} />
                  <PRow label="ロット数"         value={form.lotSize ? `${form.lotSize} lot` : ""} />
                  <PRow label="リスクリワード"   value={calc.rrStr} />
                </PSection>

                <PSection title="取引理由">
                  <PRow label="エントリー理由" value={form.entryReason} />
                  <PRow label="決済理由"       value={form.exitReason} />
                </PSection>

                <PSection title="結果">
                  <PRow label="結果"       value={form.result} />
                  <PRow label="ルール遵守" value={form.ruleCompliance} />
                </PSection>

                <PSection title="振り返り">
                  <PRow label="感情メモ"       value={form.emotionMemo} />
                  <PRow label="振り返り"       value={form.review} />
                  <PRow label="次回の改善点"   value={form.nextImprovement} />
                </PSection>

                <PSection title="補足">
                  <PRow label="スクリーンショットURL / メモ" value={form.screenshotUrl} />
                </PSection>
              </div>
            </div>

            {/* Save panel */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <p className="text-xs font-semibold text-slate-600">保存・コピー</p>
              <div className="grid grid-cols-2 gap-2">
                {/* PDF */}
                <button
                  type="button"
                  onClick={handlePdf}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>PDFで保存</span>
                </button>
                {/* CSV */}
                <button
                  type="button"
                  onClick={handleDlCsv}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>CSVで保存</span>
                </button>
                {/* Text */}
                <button
                  type="button"
                  onClick={handleDlTxt}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>テキストで保存</span>
                </button>
                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold rounded-lg transition-all border ${
                    copied
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 shrink-0" /><span>コピーしました</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 shrink-0" /><span>クリップボードにコピー</span></>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                PDFはブラウザの印刷ダイアログから「PDFに保存」を選択してください。CSVはUTF-8 BOM付き出力のため、Excelやスプレッドシートでも文字化けしません。
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

          </div>
        </div>

        {/* ── 記録項目の解説 ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-1">記録項目の意味</h2>
          <p className="text-sm text-slate-500 mb-5">各入力項目が何を記録するための項目かを解説します</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELD_EXPLANATIONS.map((item) => (
              <div key={item.title} className="p-4 border border-slate-200 rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 使い方 ─────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-1">トレード日誌作成ツールの使い方</h2>
          <p className="text-sm text-slate-500 mb-5">8ステップで日誌を作成・ダウンロードできます</p>
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

        {/* ── 続けるためのコツ ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-1">トレード日誌を続けるためのコツ</h2>
          <p className="text-sm text-slate-500 mb-5">継続することで記録から学ぶ質が高まります</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 bg-brand-50 border border-brand-100 rounded-xl">
                <span className="w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">{tip.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 関連ツール ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-1">トレード日誌と一緒に使いたい無料ツール</h2>
          <p className="text-sm text-slate-500 mb-4">日誌の各項目を計算・確認するための専用ツール</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => trackRelatedToolClick(tool.label)}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 shrink-0">
                    {tool.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors flex-1">
                    {tool.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-11">{tool.desc}</p>
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


        {/* ── 関連記事 ───────────────────────────────────────────────────── */}
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
        <AffiliateSection itemIds={TOOL_AFFILIATE_MAP["trade-journal-template"] ?? []} />

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-5">よくある質問</h2>
          <FAQSection items={FAQ_ITEMS} />
        </section>

        {/* ── Disclaimer ─────────────────────────────────────────────────── */}
        <DisclaimerBox />

      </div>
    </div>
  );
}
