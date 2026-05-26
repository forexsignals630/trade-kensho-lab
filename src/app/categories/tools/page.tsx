import Link from "next/link";
import Image from "next/image";
import { Wrench, ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import ToolCard from "@/components/ToolCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import AffiliateSection from "@/components/AffiliateSection";
import { CATEGORY_AFFILIATE_MAP } from "@/data/affiliateItems";
import type { ToolInfo } from "@/components/ToolCard";
import { getAllArticles } from "@/lib/articles";
import { buildMetadata, SITE_URL } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "ツール解説の記事一覧",
  description:
    "トレード検証ラボで提供している無料計算ツールの使い方、計算式、注意点を解説する記事をまとめています。",
  path: "/categories/tools",
});

const RELATED_TOOLS: ToolInfo[] = [
  {
    title: "ロット計算ツール",
    description: "口座資金・リスク率・損切り幅からロット数を計算",
    href: "/tools/lot-calculator",
    icon: "🧮",
    badge: "人気",
  },
  {
    title: "pips計算ツール",
    description: "エントリー・SL・TP価格からpipsまたはpointsを計算",
    href: "/tools/pips-calculator",
    icon: "📐",
  },
  {
    title: "リスクリワード計算ツール",
    description: "エントリー・SL・TPからRR比と損益分岐勝率を算出",
    href: "/tools/risk-reward-calculator",
    icon: "⚖️",
  },
  {
    title: "期待値計算ツール",
    description: "勝率と平均損益から戦略の期待値をR単位で確認",
    href: "/tools/expectancy-calculator",
    icon: "📊",
  },
  {
    title: "損益計算ツール",
    description: "通貨ペア・ロット数・値幅から想定損益を計算",
    href: "/tools/profit-loss-calculator",
    icon: "💵",
    badge: "NEW",
  },
  {
    title: "トレード日誌作成ツール",
    description: "取引記録を入力してPDF・CSV・テキスト形式で保存",
    href: "/tools/trade-journal-template",
    icon: "📓",
    badge: "NEW",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "ツール解説の記事一覧",
  description: "トレード検証ラボで提供している無料計算ツールの使い方、計算式、注意点を解説する記事。",
  url: `${SITE_URL}/categories/tools`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function ToolsCategoryPage() {
  // ツール解説に関連する記事：TradingView解説 + ロット計算ガイドなど
  const articles = getAllArticles().filter(
    (a) =>
      a.category === "TradingView" ||
      a.category === "ツール解説" ||
      Boolean(a.tags?.some((t) => ["ツール", "ツール比較", "チャート"].includes(t)))
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "カテゴリ一覧", href: "/categories" },
          { label: "ツール解説" },
        ]}
      />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">ツール解説</h1>
        </div>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          トレード検証ラボで提供している無料計算ツールの使い方、計算式、注意点を解説します。
        </p>
      </div>

      {/* Category description card */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl px-6 py-5 mb-8">
        <h2 className="text-sm font-bold text-purple-900 mb-2">このカテゴリで学べること</h2>
        <ul className="space-y-1.5 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5 shrink-0">•</span>
            各計算ツールの入力項目と計算式の仕組み
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5 shrink-0">•</span>
            ロット計算・リスクリワード・期待値ツールの使い方
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5 shrink-0">•</span>
            TradingViewなどのチャートツールの機能と使い方
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5 shrink-0">•</span>
            CFD銘柄ごとの計算上の注意点（1lotあたりの価値の違いなど）
          </li>
        </ul>
      </div>

      {/* Related tools */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">関連する無料ツール</h2>
          <Link href="/tools" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            ツール一覧 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RELATED_TOOLS.map((tool) => (
            <ToolCard key={tool.href} tool={tool} variant="compact" />
          ))}
        </div>
      </section>

      {/* Funded7 Wide Banner */}
      <div className="relative mb-8 banner-hover-lift">
        <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
        <a
          href="https://my.funded7.com/ja/sign-up?affiliateId=MogusaFX"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/funded7_banner.png" alt="Funded7" width={1200} height={160} className="w-full h-auto" />
        </a>
      </div>

      {/* Article list */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          記事一覧
          <span className="ml-2 text-sm font-normal text-slate-400">{articles.length}件</span>
        </h2>
        {articles.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-sm">記事を準備中です</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>

      <AffiliateSection itemIds={CATEGORY_AFFILIATE_MAP["tools"] ?? []} />
      <DisclaimerBox variant="category" />
    </div>
    </>
  );
}
