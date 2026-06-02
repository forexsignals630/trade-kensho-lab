"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  Calculator,
  AlertTriangle,
  ArrowRight,
  Wallet,
  SlidersHorizontal,
  Scissors,
  BarChart3,
  Info,
  RefreshCw,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import ToolCard, { type ToolInfo } from "@/components/ToolCard";
import AffiliateSection from "@/components/AffiliateSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { TOOL_AFFILIATE_MAP } from "@/data/affiliateItems";
import { calculateLot } from "@/lib/calculations/lot";
import { trackToolCalculate, trackRelatedToolClick, trackAffiliateClick } from "@/lib/analytics";
import { clampNumber, roundTo } from "@/lib/utils";
import type { ArticleMeta } from "@/types/article";

// ─── Types ───────────────────────────────────────────────────────────────────

type AccountCurrency = "JPY" | "USD";
type PairCode =
  | "AUDUSD" | "EURUSD" | "GBPJPY" | "GBPUSD" | "NZDUSD"
  | "USDCAD" | "USDCHF" | "USDJPY" | "XAUUSD" | "BTCUSD"
  | "JP225"  | "US100"  | "US500"
  | "AUDCAD" | "AUDJPY" | "AUDCHF" | "AUDNZD"
  | "CADCHF" | "CHFJPY"
  | "EURAUD" | "EURCAD" | "EURCHF" | "EURGBP" | "EURJPY" | "EURNZD"
  | "GBPAUD" | "GBPCAD" | "GBPCHF" | "GBPNZD"
  | "NZDJPY" | "NZDCAD" | "NZDCHF" | "CADJPY";

type SlMode = "pips" | "price";
type LotTypeKey = "standard" | "mini" | "micro";

interface FormState {
  accountCurrency: AccountCurrency;
  accountBalance: number;
  pair: PairCode;
  lotTypeKey: LotTypeKey;
  riskPercent: number;
  slMode: SlMode;
  slPips: number;
  entryPrice: number;
  slPrice: number;
  conversionRate: number;
  cfdPointValue: number;
  /** XAUUSD only: ounces per lot (1 | 10 | 100) */
  xauOzPerLot: number;
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

const PAIR_QUOTE: Record<PairCode, string> = {
  AUDUSD: "USD", EURUSD: "USD", GBPJPY: "JPY", GBPUSD: "USD",
  NZDUSD: "USD", USDCAD: "CAD", USDCHF: "CHF", USDJPY: "JPY",
  XAUUSD: "USD", BTCUSD: "USD", JP225: "JPY", US100: "USD", US500: "USD",
  AUDCAD: "CAD", AUDJPY: "JPY", AUDCHF: "CHF", AUDNZD: "NZD",
  CADCHF: "CHF", CHFJPY: "JPY",
  EURAUD: "AUD", EURCAD: "CAD", EURCHF: "CHF", EURGBP: "GBP",
  EURJPY: "JPY", EURNZD: "NZD",
  GBPAUD: "AUD", GBPCAD: "CAD", GBPCHF: "CHF", GBPNZD: "NZD",
  NZDJPY: "JPY", NZDCAD: "CAD", NZDCHF: "CHF", CADJPY: "JPY",
};

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

const CONVERSION_DEFAULTS: Record<string, number> = {
  "USD-JPY": 150,  "CAD-JPY": 110,  "CHF-JPY": 168,
  "NZD-JPY": 91,   "AUD-JPY": 98,   "GBP-JPY": 192,
  "JPY-USD": 0.0067, "CAD-USD": 0.74, "CHF-USD": 1.10,
  "NZD-USD": 0.61,   "AUD-USD": 0.65, "GBP-USD": 1.28,
};

const LOT_TYPES: { value: LotTypeKey; label: string; currencyAmount: number }[] = [
  { value: "standard", label: "スタンダード：1 lot = 100,000通貨", currencyAmount: 100_000 },
  { value: "mini",     label: "ミニ：1 lot = 10,000通貨",           currencyAmount: 10_000 },
  { value: "micro",    label: "マイクロ：1 lot = 1,000通貨",        currencyAmount: 1_000 },
];

const DEFAULT_FORM: FormState = {
  accountCurrency: "JPY",
  accountBalance: 1_000_000,
  pair: "USDJPY",
  lotTypeKey: "standard",
  riskPercent: 1.0,
  slMode: "pips",
  slPips: 25,
  entryPrice: 150.0,
  slPrice: 149.75,
  conversionRate: 150,
  cfdPointValue: 1,
  xauOzPerLot: 1,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCFD(pair: PairCode): boolean { return CFD_PAIRS.has(pair); }
function getUnit(pair: PairCode): string { return isCFD(pair) ? "points" : "pips"; }

interface ConversionInfo {
  needed: boolean;
  label: string;
  defaultRate: number;
}

function getConversionInfo(accountCurrency: AccountCurrency, pair: PairCode): ConversionInfo {
  // XAUUSD is priced in USD — JPY accounts need a USDJPY rate to convert pip value
  if (pair === "XAUUSD" && accountCurrency === "JPY") {
    return {
      needed: true,
      label: "1 USD = ? JPY　換算レート（USDJPY）",
      defaultRate: CONVERSION_DEFAULTS["USD-JPY"] ?? 150,
    };
  }
  if (isCFD(pair)) return { needed: false, label: "", defaultRate: 1 };
  const quote = PAIR_QUOTE[pair] ?? "USD";
  if (quote === accountCurrency) return { needed: false, label: "", defaultRate: 1 };
  const key = `${quote}-${accountCurrency}`;
  return {
    needed: true,
    label: `1 ${quote} = ? ${accountCurrency}　換算レート`,
    defaultRate: CONVERSION_DEFAULTS[key] ?? 1,
  };
}

// ─── Static data ─────────────────────────────────────────────────────────────

const RELATED_TOOLS: ToolInfo[] = [
  { title: "損益計算ツール",       description: "ロット×値幅から想定損益を計算",   href: "/tools/profit-loss-calculator",    icon: "💵" },
  { title: "リスクリワード計算", description: "RR比と損益分岐勝率を計算",        href: "/tools/risk-reward-calculator",    icon: "⚖️" },
  { title: "期待値計算ツール",   description: "勝率と損益から期待値を算出",       href: "/tools/expectancy-calculator",     icon: "📊" },
  { title: "pips計算ツール",     description: "価格差をpipsまたはpointsで確認",   href: "/tools/pips-calculator",           icon: "📐" },
  { title: "スプレッドコスト計算", description: "取引ごとのコストを試算",         href: "/tools/spread-cost-calculator",    icon: "💴" },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "このロット計算ツールでは何ができますか？",
    answer:
      "口座資金、許容リスク率、損切り幅から、1回の取引で許容損失額に収まるロット数を計算できます。\n\n損切り幅はpips/pointsで直接入力できるほか、エントリー価格とストップロス価格を入力して自動計算することもできます。\n\nFX通貨ペアだけでなく、XAUUSD・BTCUSD・JP225・US100・US500などのCFD銘柄にも対応しています。",
  },
  {
    question: "pipsが分からなくても使えますか？",
    answer:
      "はい、使えます。\n\npipsが分からない場合は、「エントリー価格から計算」を選び、エントリー価格とストップロス価格を入力してください。\n\nたとえばUSDJPYで、エントリー価格が150.000、ストップロス価格が149.750の場合、価格差は0.250です。USDJPYでは1pips = 0.01として計算するため、損切り幅は25pipsになります。",
  },
  {
    question: "pipsとpointsの違いは何ですか？",
    answer:
      "FX通貨ペアでは、損切り幅をpipsで表すのが一般的です。\n\n一方、XAUUSD・BTCUSD・JP225・US100・US500などのCFD銘柄では、pointsとして扱います。\n\nこのツールでは、FX通貨ペアを選んだ場合はpips、CFD銘柄を選んだ場合はpointsとして自動的に表示を切り替えます。",
  },
  {
    question: "1lotあたりの通貨量とは何ですか？",
    answer:
      "1lotあたりの通貨量とは、1.00 lotを取引したときに何通貨分の取引になるかを表すものです。\n\n一般的には、スタンダード口座では1lot = 100,000通貨、ミニ口座では1lot = 10,000通貨、マイクロ口座では1lot = 1,000通貨として扱われることがあります。\n\nただし、実際の仕様はブローカーや口座タイプによって異なる場合があります。ご利用の取引環境に合わせて選択してください。",
  },
  {
    question: "スタンダード・ミニ・マイクロの違いは何ですか？",
    answer:
      "違いは、主に1lotあたりの通貨量です。\n\n・スタンダード：1lot = 100,000通貨\n・ミニ：1lot = 10,000通貨\n・マイクロ：1lot = 1,000通貨\n\n同じ0.10 lotでも、1lotの基準が違うと実際の取引量が変わります。ロット計算では「1lotが何通貨なのか」を正しく設定することが重要です。",
  },
  {
    question: "口座通貨はJPYとUSDのどちらを選べばいいですか？",
    answer:
      "ご利用の取引口座の基準通貨に合わせて選んでください。\n\n日本円口座なら「日本円（JPY）」、米ドル口座なら「米ドル（USD）」を選びます。\n\n口座通貨と取引銘柄の損益通貨が異なる場合は、換算レートが必要になることがあります。",
  },
  {
    question: "換算レートはなぜ必要ですか？",
    answer:
      "口座通貨と、取引銘柄の損益が発生する通貨が異なる場合、損益を口座通貨に換算する必要があるためです。\n\nたとえば、日本円口座でEURUSDを取引する場合、損益は主にUSD建てで計算されるため、USDJPY換算レートが必要になります。\n\n「自動取得」ボタンを押すと、外部APIからリアルタイムのレートを取得して自動入力できます。また、手動で任意のレートを入力することも可能です。",
  },
  {
    question: "XAUUSDやBTCUSDも正確に計算できますか？",
    answer:
      "XAUUSDとBTCUSDも計算できますが、ブローカーによって仕様が異なる点に注意が必要です。\n\n【XAUUSD（ゴールド）について】\nXAUUSDは、ブローカーによって1lotあたりのオンス数が異なります。主な種類は以下の3種類です。\n\n・1 lot = 1 oz（一部の業者）\n・1 lot = 10 oz\n・1 lot = 100 oz（標準的な仕様）\n\nこのツールでXAUUSDを選ぶと「1lotあたりのオンス数」を選択できるようになり、1pointあたりの損益が自動で計算されます。JPY口座の場合はUSDJPYの換算レートも入力してください。\n\n【BTCUSDについて】\nBTCUSDは「1lotあたり1pointの損益」をご利用のブローカーのコントラクトスペックで確認して手動入力してください。",
  },
  {
    question: "JP225・US100・US500にも対応していますか？",
    answer:
      "はい、対応しています。\n\nただし、株価指数CFDもブローカーによって1lotあたりの価値が異なる場合があります。\n\nJP225・US100・US500を選ぶ場合は、1lotあたり1point動いたときの損益額を確認したうえで入力してください。",
  },
  {
    question: "許容リスク率は何%にすればいいですか？",
    answer:
      "このツールでは、許容リスク率を入力すると、口座資金に対するリスク許容額を計算します。\n\nたとえば、口座資金100万円で許容リスク率を1%にすると、1回の取引で許容する損失額は1万円です。\n\n何%が適切かは、取引ルール、資金管理方針、リスク許容度によって異なります。このツールでは特定のリスク率を推奨しません。",
  },
  {
    question: "計算されたロット数でそのまま取引してよいですか？",
    answer:
      "このツールの計算結果は、記録・計算支援を目的とした参考値です。\n\nエントリーの可否、相場の方向性、利益の見込みを判断するものではありません。\n\n実際の売買判断は、ご自身の責任で行ってください。",
  },
  {
    question: "計算結果がブローカーの表示と違うことはありますか？",
    answer:
      "あります。\n\nブローカーによって、1lotあたりの通貨量、CFD銘柄の1point価値、最小取引数量、丸め処理、手数料、スプレッド、スワップ、証拠金計算が異なる場合があります。\n\nこのツールは一般的な計算式に基づく補助ツールです。実際の発注前には、ご利用の取引環境で必ず確認してください。",
  },
];

const COMMON_MISTAKES = [
  {
    title: "1lotあたりの通貨量を間違える",
    desc: "スタンダード（100,000通貨）・ミニ（10,000通貨）・マイクロ（1,000通貨）は大きく異なります。ご利用の口座タイプを必ず確認してください。",
  },
  {
    title: "pipsとpointsを混同する",
    desc: "FX通貨ペアはpips、XAUUSD・BTCUSD・JP225などのCFD銘柄はpointsで計算します。単位を間違えるとロット数が大きくズレます。",
  },
  {
    title: "CFD銘柄のロット仕様を確認しない",
    desc: "XAUUSDは業者によって1lotが1oz・10oz・100ozと異なります。このツールではオンス数を選択すると自動計算しますが、BTCUSDなど他のCFDは1pointあたりの損益をコントラクトスペックで確認して入力してください。",
  },
  {
    title: "許容リスク率を高くしすぎる",
    desc: "1回の取引で資金の5%以上を失うとドローダウンから回復しにくくなります。一般的には1〜2%を目安に設定することを検討してください。",
  },
  {
    title: "エントリー価格とストップロス価格の差を確認しない",
    desc: "価格入力モードでは|エントリー価格 − SL価格|をpipサイズで割って損切り幅を計算します。入力した2つの価格が正しいか確認しましょう。",
  },
  {
    title: "計算結果を売買判断として使う",
    desc: "このツールは資金管理の計算支援ツールです。「何を買うべきか」「いつエントリーするか」などの売買判断を示すものではありません。",
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  relatedArticles: ArticleMeta[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LotCalculatorClient({ relatedArticles }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  async function fetchConversionRate() {
    // Determine which currency pair to fetch (quote currency → account currency)
    const fromCurrency =
      form.pair === "XAUUSD" ? "USD" : (PAIR_QUOTE[form.pair] ?? "USD");
    const toCurrency = form.accountCurrency;

    setRateLoading(true);
    setRateError(null);
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error("response error");
      const data = await res.json() as { rates: Record<string, number> };
      const rate = data.rates[toCurrency];
      if (!rate) throw new Error("rate not found");
      setForm((prev) => ({ ...prev, conversionRate: parseFloat(rate.toFixed(4)) }));
      setRateError(null);
    } catch {
      setRateError("自動取得に失敗しました。手動で入力してください。");
    } finally {
      setRateLoading(false);
    }
  }

  const isCfd = isCFD(form.pair);
  const unit = getUnit(form.pair);
  const pipSize = PIP_SIZE[form.pair] ?? 0.0001;
  const priceStep = PRICE_STEP[form.pair] ?? "0.00001";
  const lotDef = LOT_TYPES.find((l) => l.value === form.lotTypeKey)!;
  const lotCurrencyAmount = lotDef?.currencyAmount ?? 100_000;
  const roundUnit = 0.01;
  const currencySymbol = form.accountCurrency === "JPY" ? "円" : "USD";

  const conversionInfo = useMemo(
    () => getConversionInfo(form.accountCurrency, form.pair),
    [form.accountCurrency, form.pair]
  );

  useEffect(() => {
    if (conversionInfo.needed) {
      setForm((prev) => ({ ...prev, conversionRate: conversionInfo.defaultRate }));
    }
  }, [conversionInfo.needed, conversionInfo.defaultRate]);

  const computedSlPips =
    form.slMode === "price"
      ? roundTo(Math.abs(form.entryPrice - form.slPrice) / pipSize, 1)
      : form.slPips;

  const fxPipValueInQuote = lotCurrencyAmount * pipSize;
  const fxPipValuePerLot = conversionInfo.needed
    ? fxPipValueInQuote * form.conversionRate
    : fxPipValueInQuote;

  // XAUUSD: 1 point = $0.01 per oz. Auto-derive point value from oz/lot + currency conversion.
  const xauPointValue =
    form.pair === "XAUUSD"
      ? form.xauOzPerLot * pipSize * (conversionInfo.needed ? form.conversionRate : 1)
      : 0;

  const pipValuePerLot =
    form.pair === "XAUUSD"
      ? xauPointValue
      : isCfd
      ? form.cfdPointValue
      : fxPipValuePerLot;

  const result = calculateLot({
    accountBalance: clampNumber(form.accountBalance, 0, 1_000_000_000),
    riskPercent: clampNumber(form.riskPercent, 0, 100),
    stopLossPips: clampNumber(computedSlPips, 0.1, 10_000),
    pipValue: clampNumber(pipValuePerLot, 0.000001, 100_000_000),
    roundUnit,
  });

  const lotTypeShort = lotDef?.label.split("：")[0] ?? "スタンダード";
  const lotBasisLabel =
    form.pair === "XAUUSD"
      ? `1 lot = ${form.xauOzPerLot} oz`
      : `1 lot = ${lotCurrencyAmount.toLocaleString()}通貨`;

  function setNum(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
  }

  function setStr<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value as FormState[K] }));
  }

  const reset = () => setForm(DEFAULT_FORM);
  const handleCalculate = () => trackToolCalculate("lot-calculator", form as unknown as Record<string, unknown>);

  const inputCls =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white";

  const unitSingular = isCfd ? "point" : "pip";
  const slDirectLabel = isCfd ? "pointsで直接入力" : "pipsで直接入力";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "無料ツール", href: "/tools" }, { label: "ロット計算ツール" }]} />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">ロット計算ツール</h1>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          口座資金・許容リスク・損切り幅から、適正ロットをシンプルに計算できる無料ツールです。
          エントリー価格とSL価格を入力するだけで損切り幅を自動計算できます。
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
          <p className="text-xs text-slate-500 mb-6">数値を入力すると、許容損失額に基づいた適正ロットを確認できます。</p>

          <div className="space-y-5">

            {/* ①② 口座通貨 + 口座資金 — 2-col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel num={1} label="口座通貨" />
                <select
                  value={form.accountCurrency}
                  onChange={setStr("accountCurrency")}
                  className={inputCls}
                >
                  <option value="JPY">日本円（JPY）</option>
                  <option value="USD">米ドル（USD）</option>
                </select>
              </div>
              <div>
                <FieldLabel num={2} label="口座資金" />
                <div className="relative">
                  <input
                    type="number"
                    value={form.accountBalance}
                    onChange={setNum("accountBalance")}
                    min={0}
                    step={1000}
                    className={`${inputCls} pr-10`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    {currencySymbol}
                  </span>
                </div>
              </div>
            </div>

            {/* ③ 通貨ペア・銘柄 */}
            <div>
              <FieldLabel num={3} label="通貨ペア・銘柄" />
              <select
                value={form.pair}
                onChange={setStr("pair")}
                className={inputCls}
              >
                {ALL_PAIRS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1.5">
                {isCfd
                  ? `${unit}サイズ：${pipSize}（CFD銘柄 — 1ロット損益は下記で入力）`
                  : `pipサイズ：${pipSize}　1lot の1pip損益：${form.accountCurrency} ${fxPipValuePerLot.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                }
              </p>
            </div>

            {/* ④ 1ロットの通貨量（XAUUSDは固定表示） */}
            {form.pair === "XAUUSD" ? (
              <div>
                <FieldLabel num={4} label="1lotあたりの通貨量" />
                <div className={`${inputCls} bg-slate-50 text-slate-500 cursor-default select-none`}>
                  ※ XAUUSD のロット単位はオンス（oz）で管理します
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  オンス数は下記の「1lotあたりのオンス数（XAUUSD）」で設定してください。
                </p>
              </div>
            ) : (
              <div>
                <FieldLabel num={4} label="1lotあたりの通貨量" />
                <select
                  value={form.lotTypeKey}
                  onChange={setStr("lotTypeKey")}
                  className={inputCls}
                >
                  {LOT_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value}>{lt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  1 lot あたりの通貨量は取引環境・口座タイプによって異なる場合があります。ご利用の口座仕様に合わせて選択してください。
                </p>
              </div>
            )}

            {/* ⑤ 許容リスク率 */}
            <div>
              <FieldLabel num={5} label="許容リスク率" />
              <div className="relative">
                <input
                  type="number"
                  value={form.riskPercent}
                  onChange={setNum("riskPercent")}
                  min={0.1}
                  max={100}
                  step={0.1}
                  className={`${inputCls} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                許容損失額：{result.allowableLoss.toLocaleString()} {currencySymbol}
              </p>
            </div>

            {/* ⑥ 損切り幅 */}
            <div>
              <FieldLabel num={6} label="損切り幅の入力方法" />
              <div className="flex rounded-lg border border-slate-200 overflow-hidden mb-3">
                {(["pips", "price"] as SlMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setForm((p) => ({ ...p, slMode: mode }))}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      form.slMode === mode
                        ? "bg-brand-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {mode === "pips" ? slDirectLabel : "エントリー価格から計算"}
                  </button>
                ))}
              </div>

              {form.slMode === "pips" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={form.slPips}
                    onChange={setNum("slPips")}
                    min={0.1}
                    step={0.1}
                    className={`${inputCls} pr-16`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">エントリー価格</label>
                    <input
                      type="number"
                      value={form.entryPrice}
                      onChange={setNum("entryPrice")}
                      step={priceStep}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">ストップロス価格</label>
                    <input
                      type="number"
                      value={form.slPrice}
                      onChange={setNum("slPrice")}
                      step={priceStep}
                      className={inputCls}
                    />
                  </div>
                  <div className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 text-xs text-brand-700 font-medium">
                    計算された損切り幅：<strong>{computedSlPips.toFixed(1)} {unit}</strong>
                    <span className="text-brand-500 font-normal ml-1">
                      （|{form.entryPrice} − {form.slPrice}| ÷ {pipSize}）
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ⑦ XAUUSD: oz/lot セレクター + 自動計算 */}
            {form.pair === "XAUUSD" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    XAUUSDは業者によって1lotあたりのオンス数が異なります。ご利用のブローカーの契約仕様を選択してください。
                  </p>
                </div>
                <div>
                  <FieldLabel num={7} label="1lotあたりのオンス数（XAUUSD）" />
                  <select
                    value={form.xauOzPerLot}
                    onChange={(e) => setForm((prev) => ({ ...prev, xauOzPerLot: parseFloat(e.target.value) }))}
                    className={inputCls}
                  >
                    <option value={1}>1 lot = 1 oz（一部業者）</option>
                    <option value={10}>1 lot = 10 oz</option>
                    <option value={100}>1 lot = 100 oz（標準）</option>
                  </select>
                </div>
                <div className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">
                  自動計算された1point損益：
                  <strong className="ml-1">
                    {xauPointValue.toLocaleString(undefined, { maximumFractionDigits: 4 })} {currencySymbol}
                  </strong>
                  <span className="text-amber-500 font-normal ml-1">
                    （{form.xauOzPerLot} oz × 0.01{conversionInfo.needed ? ` × ${form.conversionRate} USDJPY` : ""}）
                  </span>
                </div>
              </div>
            )}

            {/* ⑦ 非XAUUSD CFD: 1lotあたり1pointの損益 */}
            {isCfd && form.pair !== "XAUUSD" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    CFD銘柄は業者によって1lotあたりの価値が異なるため、ご利用の取引環境に合わせて入力してください。
                  </p>
                </div>
                <FieldLabel num={7} label="1lotあたり1pointの損益" />
                <div className="relative">
                  <input
                    type="number"
                    value={form.cfdPointValue}
                    onChange={setNum("cfdPointValue")}
                    min={0.000001}
                    step="0.01"
                    className={`${inputCls} pr-10`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    {currencySymbol}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">ご利用のブローカーの契約仕様を確認してください。</p>
              </div>
            )}

            {/* ⑦ FX / XAUUSD-JPY: 換算レート（必要な場合のみ） */}
            {conversionInfo.needed && (!isCfd || form.pair === "XAUUSD") && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    {form.pair === "XAUUSD"
                      ? "XAUUSDはUSD建て価格のため、JPY口座で計算するにはUSDJPYの換算レートが必要です。"
                      : `口座通貨（${form.accountCurrency}）と${form.pair}の決済通貨（${PAIR_QUOTE[form.pair]}）が異なるため、換算レートが必要です。`
                    }
                  </p>
                </div>
                <FieldLabel num={form.pair === "XAUUSD" ? 8 : 7} label={conversionInfo.label} />
                {/* Input + 自動取得ボタン */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.conversionRate}
                    onChange={setNum("conversionRate")}
                    min={0.000001}
                    step="0.001"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={fetchConversionRate}
                    disabled={rateLoading}
                    className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-700 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${rateLoading ? "animate-spin" : ""}`} />
                    {rateLoading ? "取得中..." : "自動取得"}
                  </button>
                </div>
                {rateError && (
                  <p className="text-xs text-red-500 mt-1">{rateError}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  「自動取得」でリアルタイムレートを反映できます。手動入力も可能です。
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Calculator className="w-4 h-4" />
              ロットを計算する
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
            ※ 実際の取引ではブローカー仕様や約定条件により異なる場合があります。
          </p>
        </div>

        {/* ── Results card ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">計算結果</h2>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            {/* Recommended lot */}
            <div className="bg-brand-600 rounded-xl p-4 text-center mb-4">
              <p className="text-xs text-brand-100 mb-0.5">推奨ロット（丸め後）</p>
              <p className="text-3xl font-extrabold text-white tabular-nums leading-none">
                {result.roundedLot.toFixed(2)}
                <span className="text-xl font-bold ml-1">lot</span>
              </p>
              <p className="text-xs text-brand-200 mt-1.5">{lotTypeShort}</p>
            </div>

            {/* Sub-metrics */}
            <div className="space-y-2.5">
              <ResultRow label="リスク許容額" value={`${result.allowableLoss.toLocaleString()} ${currencySymbol}`} />
              <ResultRow label="損切り幅" value={`${computedSlPips.toFixed(1)} ${unit}`} highlight />
              <ResultRow
                label={`1${unitSingular}あたりの損益（1lot）`}
                value={`${pipValuePerLot.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${currencySymbol}`}
              />
              <ResultRow label="想定損失額（丸め後）" value={`${result.actualLoss.toLocaleString()} ${currencySymbol}`} />
              <ResultRow label="ロット基準" value={lotBasisLabel} />
              {form.pair === "XAUUSD" && (
                <ResultRow
                  label="1pointあたり損益（XAUUSD）"
                  value={`${xauPointValue.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${currencySymbol}`}
                />
              )}
              {isCfd && form.pair !== "XAUUSD" && (
                <ResultRow label="1lotあたり1pointの損益" value={`${form.cfdPointValue} ${currencySymbol}`} />
              )}
              {conversionInfo.needed && (
                <ResultRow
                  label="使用換算レート"
                  value={`1 ${form.pair === "XAUUSD" ? "USD" : (PAIR_QUOTE[form.pair] ?? "USD")} = ${form.conversionRate} ${form.accountCurrency}`}
                />
              )}
            </div>

            {/* Formula */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-4 text-center">
              <p className="text-xs text-slate-500 mb-1">計算式</p>
              <p className="text-xs font-mono text-slate-700 tabular-nums break-all">
                {result.allowableLoss.toLocaleString()} ÷ ({computedSlPips.toFixed(1)} × {pipValuePerLot.toLocaleString(undefined, { maximumFractionDigits: 4 })}) = <strong className="text-brand-700">{result.rawLot.toFixed(3)}</strong>
              </p>
            </div>

            {/* CFD warning */}
            {isCfd && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  CFD銘柄の1lotあたりの価値や最小変動単位は業者によって異なる場合があります。ご利用の取引環境に合わせて確認してください。
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 mt-3 leading-relaxed text-center">
              この計算結果は記録・計算支援を目的としたものであり、<br className="hidden sm:block" />
              売買判断を推奨するものではありません。
            </p>
          </div>

          {/* TradingView Square Banner */}
          <div className="relative banner-hover-lift">
            <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">
              PR
            </span>
            <a
              href="https://jp.tradingview.com/?aff_id=156243"
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick("TradingView", "https://jp.tradingview.com/?aff_id=156243")}
              className="block rounded-xl overflow-hidden border border-slate-100"
            >
              <Image
                src="/images/affiliates/tradingview_square.jpg"
                alt="TradingView"
                width={500}
                height={500}
                className="w-full h-auto"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ── 計算式の考え方 ───────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-5">計算式の考え方</h2>

        {/* 基本の計算式 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 mb-2">① リスク許容額</p>
            <p className="font-mono text-sm font-bold text-slate-800 mb-3">
              リスク許容額 = 口座資金 × 許容リスク率
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>口座資金：取引に使う有効証拠金を口座通貨で入力します。</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>許容リスク率：1回の取引で許容する損失の割合（%）です。</li>
            </ul>
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 mb-2">② 推奨ロット</p>
            <p className="font-mono text-sm font-bold text-slate-800 mb-3">
              推奨ロット = リスク許容額 ÷ (損切り幅 × 1pip/point損益)
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>FX通貨ペア：損切り幅はpips単位で計算します。</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>CFD銘柄：損切り幅はpoints単位で計算します。</li>
              <li className="flex gap-2"><span className="text-brand-400 shrink-0">•</span>1pip/point損益はブローカー仕様や換算レートによって変わります。</li>
            </ul>
          </div>
        </div>

        {/* FX計算例 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">FX通貨ペアの計算例（USDJPY）</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <p className="text-slate-500">入力条件</p>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>口座資金：1,000,000円　許容リスク：1%</li>
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>通貨ペア：USDJPY　1lot = 100,000通貨</li>
                <li className="flex gap-2"><span className="text-slate-400 shrink-0">•</span>損切り幅：25pips</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-500">計算の流れ</p>
              <ul className="space-y-1 font-mono">
                <li>リスク許容額 = 1,000,000 × 1% = 10,000円</li>
                <li>1pip損益 = 100,000 × 0.01 = 1,000円</li>
                <li>推奨ロット = 10,000 ÷ (25 × 1,000) = <strong className="text-brand-700">0.40 lot</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* CFDについて */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-amber-800 mb-2">CFD銘柄（XAUUSD・BTCUSD・JP225・US100・US500）について</p>
          <ul className="space-y-1.5 text-xs text-amber-700">
            <li className="flex gap-2"><span className="shrink-0">•</span>CFD銘柄は損切り幅をpipsではなく<strong>points</strong>で表します。</li>
            <li className="flex gap-2"><span className="shrink-0">•</span>1lotあたり1pointの損益はブローカーによって異なるため、契約仕様を確認して入力してください。</li>
            <li className="flex gap-2"><span className="shrink-0">•</span>このツールでは「1lotあたり1pointの損益」欄に入力した値をそのまま計算に使います。</li>
          </ul>
        </div>

        {/* 価格からpips計算 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-3">
          <p className="font-semibold text-slate-700">エントリー価格からpips/pointsを計算する方法</p>
          <p className="font-mono text-slate-700">損切り幅 = |エントリー価格 − SL価格| ÷ pipサイズ（またはpointサイズ）</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-600">pipサイズ一覧</p>
              <ul className="space-y-1 text-slate-500">
                <li>JPY決済ペア（USDJPY等）：0.01</li>
                <li>その他FX（EURUSD等）：0.0001</li>
                <li>XAUUSD：0.01</li>
                <li>BTCUSD / JP225 / US100 / US500：1</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-600">計算例</p>
              <div className="font-mono space-y-1 text-slate-600 bg-white border border-slate-200 rounded-lg p-2">
                <p>USDJPY: 150.000 → 149.750</p>
                <p>0.250 ÷ 0.01 = <strong className="text-brand-700">25 pips</strong></p>
              </div>
              <div className="font-mono space-y-1 text-slate-600 bg-white border border-slate-200 rounded-lg p-2">
                <p>EURUSD: 1.08500 → 1.08250</p>
                <p>0.00250 ÷ 0.0001 = <strong className="text-brand-700">25 pips</strong></p>
              </div>
            </div>
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
              icon: <Wallet className="w-5 h-5 text-brand-600" />,
              title: "口座通貨を選ぶ",
              desc: "JPY（日本円）またはUSD（米ドル）から、ご利用の取引口座の通貨を選択します。",
            },
            {
              step: 2,
              icon: <Wallet className="w-5 h-5 text-brand-600" />,
              title: "口座資金を入力する",
              desc: "現在の有効証拠金または口座残高を口座通貨の単位で入力します。",
            },
            {
              step: 3,
              icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
              title: "通貨ペア・銘柄を選ぶ",
              desc: "取引したいFX通貨ペアまたはCFD銘柄を選択します。選択するとpip/pointサイズが自動で設定されます。",
            },
            {
              step: 4,
              icon: <SlidersHorizontal className="w-5 h-5 text-brand-600" />,
              title: "FX / CFDに応じた設定をする",
              desc: "FXの場合：「1ロットの通貨量」を選びます。CFDの場合：「1lotあたり1pointの損益」をブローカーの仕様に合わせて入力します。",
            },
            {
              step: 5,
              icon: <Wallet className="w-5 h-5 text-brand-600" />,
              title: "許容リスク率を入力する",
              desc: "1回の取引で許容する損失の割合（%）を入力します。一般的には1〜2%が目安です。",
            },
            {
              step: 6,
              icon: <Scissors className="w-5 h-5 text-brand-600" />,
              title: "損切り幅を設定する",
              desc: "pips/pointsを直接入力するか、エントリー価格とストップロス価格を入力して自動計算するかを選べます。",
            },
            {
              step: 7,
              icon: <SlidersHorizontal className="w-5 h-5 text-brand-600" />,
              title: "計算結果を確認する",
              desc: "推奨ロット・リスク許容額・想定損失額が表示されます。発注前の資金管理確認やトレード日誌への記録に活用してください。",
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
      <AffiliateSection itemIds={TOOL_AFFILIATE_MAP["lot-calculator"] ?? []} />

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
