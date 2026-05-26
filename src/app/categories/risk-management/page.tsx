import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowRight } from "lucide-react";
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
  title: "リスク管理の記事一覧",
  description:
    "ロット計算、損切り幅、許容リスク率、リスクリワードなど、トレードの資金管理に関する記事をまとめています。",
  path: "/categories/risk-management",
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
    title: "リスクリワード計算ツール",
    description: "エントリー・SL・TPからRR比と損益分岐勝率を算出",
    href: "/tools/risk-reward-calculator",
    icon: "⚖️",
  },
  {
    title: "pips計算ツール",
    description: "エントリー・SL・TP価格からpipsまたはpointsを計算",
    href: "/tools/pips-calculator",
    icon: "📐",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "リスク管理の記事一覧",
  description: "ロット計算、損切り幅、許容リスク率、リスクリワードなど、トレードの資金管理に関する実務記事。",
  url: `${SITE_URL}/categories/risk-management`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function RiskManagementCategoryPage() {
  const articles = getAllArticles().filter(
    (a) =>
      a.category === "リスク管理" ||
      ["how-to-use-lot-calculator", "how-to-use-risk-reward-calculator"].includes(a.slug)
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "カテゴリ一覧", href: "/categories" },
          { label: "リスク管理" },
        ]}
      />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">リスク管理</h1>
        </div>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          ロット計算、損切り幅、許容リスク率、リスクリワードなど、トレードの資金管理に関する記事をまとめています。
        </p>
      </div>

      {/* Category description card */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-5 mb-8">
        <h2 className="text-sm font-bold text-green-900 mb-2">このカテゴリで学べること</h2>
        <ul className="space-y-1.5 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5 shrink-0">•</span>
            口座資金・リスク率・損切り幅を使ったロット計算の仕組み
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5 shrink-0">•</span>
            リスクリワード比（RR比）の計算方法と損益分岐勝率の意味
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5 shrink-0">•</span>
            1回の取引でどこまでの損失を許容するかの考え方
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5 shrink-0">•</span>
            ドローダウンと破産確率の数学的な関係
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RELATED_TOOLS.map((tool) => (
            <ToolCard key={tool.href} tool={tool} variant="compact" />
          ))}
        </div>
      </section>

      {/* Vantage Wide Banner */}
      <div className="relative mb-8 banner-hover-lift">
        <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
        <a
          href="https://www.vantagetradings.com/open-live-account/?affid=MTUwMzY0"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/vantage_1.jpg" alt="Vantage" width={1200} height={160} className="w-full h-auto" />
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

      <AffiliateSection itemIds={CATEGORY_AFFILIATE_MAP["risk-management"] ?? []} />
      <DisclaimerBox variant="category" />
    </div>
    </>
  );
}
