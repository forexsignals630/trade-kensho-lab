/**
 * アフィリエイト・外部サービス掲載データ
 *
 * 掲載目的：記録・分析環境の整備を目的とした参考情報です。
 * 売買判断・投資助言・利益保証を目的としたものではありません。
 *
 * href が空文字列のカードはコンポーネント側で非表示になります。
 */

export interface AffiliateItem {
  /** 一意のID（コンポーネントから参照する際に使用） */
  id: string;
  /** サービス名 */
  title: string;
  /** カテゴリ（表示用ラベル） */
  category: string;
  /** 短い説明文（2〜3文） */
  description: string;
  /** 主な用途 */
  useCase: string;
  /** CTAボタンのラベル */
  ctaLabel: string;
  /** リンク先 URL。空文字列の場合はカードを非表示 */
  href: string;
  /** ロゴ画像パス（/public 以下の絶対パス）。icon より優先して表示 */
  image?: string;
  /** アイコン絵文字（image がない場合に使用） */
  icon?: string;
  /** PR / スポンサード掲載かどうか */
  isSponsored: boolean;
}

const AFFILIATE_ITEMS: AffiliateItem[] = [
  {
    id: "funded7",
    title: "Funded7",
    category: "プロップトレード",
    description:
      "チャレンジ形式の評価に合格すると、会社資金でのトレード機会を提供するプロップトレードサービスです。自己資金とは別のトレード環境として確認できます。",
    useCase: "プロップトレード・資金調達チャレンジ",
    ctaLabel: "詳細を見る",
    href: "https://my.funded7.com/ja/sign-up?affiliateId=MogusaFX",
    image: "/images/affiliates/funded7.png",
    isSponsored: true,
  },
  {
    id: "fintokei",
    title: "Fintokei",
    category: "プロップトレード",
    description:
      "チャレンジ形式の評価プログラムに合格すると、会社資金でのトレード機会を提供するプロップトレードサービスです。日本語サポートにも対応しており、自己資金とは別の検証環境として確認できます。",
    useCase: "プロップトレード・資金調達チャレンジ",
    ctaLabel: "詳細を見る",
    href: "https://www.fintokei.com/jp/?affiliate=987",
    image: "/images/affiliates/fintokei.png",
    isSponsored: true,
  },
  {
    id: "vantage",
    title: "Vantage",
    category: "海外FX・CFDブローカー",
    description:
      "FX・CFD・株価指数などを取り扱う海外ブローカーです。MT4/MT5に対応しており、検証や記録で使用するデモ口座・実口座の環境として確認できます。",
    useCase: "取引口座・デモ環境の整備",
    ctaLabel: "詳細を見る",
    href: "https://www.vantagetradings.com/open-live-account/?affid=MTUwMzY0",
    image: "/images/affiliates/vantage.png",
    isSponsored: true,
  },
  {
    id: "tradingview",
    title: "TradingView",
    category: "チャート分析ツール",
    description:
      "チャート表示、ウォッチリスト、アラート、インジケーター確認などに使える分析ツールです。トレード記録と合わせてチャート環境を整えることができます。",
    useCase: "チャート確認・検証記録の補助",
    ctaLabel: "公式サイトを見る",
    href: "https://jp.tradingview.com/?aff_id=156243",
    image: "/images/affiliates/tradingview.png",
    isSponsored: true,
  },
  {
    id: "trade-journal-saas",
    title: "トレード日誌・分析SaaS",
    category: "記録・分析ツール",
    description:
      "取引記録、振り返り、成績分析を効率化するための外部サービスです。週次・月次での傾向確認に活用できます。",
    useCase: "トレード記録・週末レビュー",
    ctaLabel: "サービスを見る",
    href: "",
    icon: "📊",
    isSponsored: true,
  },
  {
    id: "vps",
    title: "VPS / クラウド環境",
    category: "取引環境",
    description:
      "自動売買や常時稼働環境を整える際に使われるクラウド環境です。MT4/MT5のEAを稼働させる際の参考環境として確認できます。",
    useCase: "稼働環境・作業環境の整備",
    ctaLabel: "詳細を見る",
    href: "",
    icon: "🖥️",
    isSponsored: true,
  },
  {
    id: "monitor-desk",
    title: "モニター・デスク環境",
    category: "作業環境",
    description:
      "複数チャートや記録画面を見やすくするためのデスク環境・モニター環境です。検証作業や記録作業の効率化に参考にできます。",
    useCase: "チャート確認・記録作業",
    ctaLabel: "関連アイテムを見る",
    href: "",
    icon: "🖥️",
    isSponsored: true,
  },
  {
    id: "record-template",
    title: "記録テンプレート",
    category: "記録補助",
    description:
      "Excel、Googleスプレッドシート、Notionなどでトレード記録を管理するためのテンプレートです。日誌管理・検証記録の整理に活用できます。",
    useCase: "日誌管理・検証記録",
    ctaLabel: "テンプレートを見る",
    href: "",
    icon: "📋",
    isSponsored: true,
  },
];

export default AFFILIATE_ITEMS;

// ─── カテゴリ別おすすめID リスト ──────────────────────────────────────────────

/** 記事カテゴリ → 表示するアフィリエイト ID の順序 */
export const ARTICLE_AFFILIATE_MAP: Record<string, string[]> = {
  "トレード記録": ["funded7", "fintokei", "vantage", "tradingview"],
  "テンプレート":  ["funded7", "fintokei", "vantage", "tradingview"],
  "リスク管理":    ["funded7", "fintokei", "vantage", "tradingview"],
  "ツール解説":    ["funded7", "fintokei", "tradingview", "vantage"],
  "TradingView":   ["funded7", "fintokei", "tradingview", "vantage"],
  "検証・バックテスト": ["funded7", "fintokei", "vantage", "tradingview"],
  "検証・分析":    ["funded7", "fintokei", "vantage", "tradingview"],
  "比較・レビュー": ["funded7", "fintokei", "tradingview", "vantage"],
  "VPS運用":       ["funded7", "fintokei", "vantage", "tradingview"],
};

/** ツールスラッグ → 表示するアフィリエイト ID の順序 */
export const TOOL_AFFILIATE_MAP: Record<string, string[]> = {
  "lot-calculator":         ["funded7", "fintokei", "vantage", "tradingview"],
  "pips-calculator":        ["funded7", "fintokei", "vantage", "tradingview"],
  "risk-reward-calculator": ["funded7", "fintokei", "vantage", "tradingview"],
  "expectancy-calculator":  ["funded7", "fintokei", "vantage", "tradingview"],
  "profit-loss-calculator": ["funded7", "fintokei", "vantage", "tradingview"],
  "trade-journal-template": ["funded7", "fintokei", "vantage", "tradingview"],
};

/** トップページ */
export const HOME_AFFILIATE_IDS: string[] = [
  "funded7",
  "fintokei",
  "vantage",
  "tradingview",
];

/** カテゴリページスラッグ → 表示 ID */
export const CATEGORY_AFFILIATE_MAP: Record<string, string[]> = {
  "trade-journal":   ["funded7", "fintokei", "vantage", "tradingview"],
  "risk-management": ["funded7", "fintokei", "vantage", "tradingview"],
  "tools":           ["funded7", "fintokei", "tradingview", "vantage"],
  "analysis":        ["funded7", "fintokei", "tradingview", "vantage"],
};
