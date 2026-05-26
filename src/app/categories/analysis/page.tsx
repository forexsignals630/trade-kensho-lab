import Link from "next/link";
import Image from "next/image";
import { BarChart2, ArrowRight } from "lucide-react";
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
  title: "検証・分析の記事一覧",
  description:
    "取引データの見返し方、期待値、バックテスト、改善点の見つけ方に関する記事をまとめています。",
  path: "/categories/analysis",
});

const RELATED_TOOLS: ToolInfo[] = [
  {
    title: "期待値計算ツール",
    description: "勝率と平均損益から戦略の期待値をR単位で確認",
    href: "/tools/expectancy-calculator",
    icon: "📊",
  },
  {
    title: "トレード日誌作成ツール",
    description: "取引記録を入力してPDF・CSV・テキスト形式で保存",
    href: "/tools/trade-journal-template",
    icon: "📓",
    badge: "NEW",
  },
  {
    title: "リスクリワード計算ツール",
    description: "エントリー・SL・TPからRR比と損益分岐勝率を算出",
    href: "/tools/risk-reward-calculator",
    icon: "⚖️",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "検証・分析の記事一覧",
  description: "取引データの見返し方、期待値、バックテスト、改善点の見つけ方に関する実務記事。",
  url: `${SITE_URL}/categories/analysis`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function AnalysisCategoryPage() {
  const articles = getAllArticles().filter(
    (a) =>
      ["検証・バックテスト", "検証・分析", "比較・レビュー"].includes(a.category) ||
      ["how-to-use-expected-value-calculator", "trade-review-weekend"].includes(a.slug)
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "カテゴリ一覧", href: "/categories" },
          { label: "検証・分析" },
        ]}
      />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-orange-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">検証・分析</h1>
        </div>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          取引データの見返し方、期待値、バックテスト、改善点の見つけ方をまとめています。
        </p>
      </div>

      {/* Category description card */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-5 mb-8">
        <h2 className="text-sm font-bold text-orange-900 mb-2">このカテゴリで学べること</h2>
        <ul className="space-y-1.5 text-sm text-orange-800">
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-0.5 shrink-0">•</span>
            トレード記録を使った週次・月次の振り返り方
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-0.5 shrink-0">•</span>
            期待値・勝率・RR比の関係と戦略の検証方法
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-0.5 shrink-0">•</span>
            バックテストツールの使い方と統計的な信頼性の考え方
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 mt-0.5 shrink-0">•</span>
            記録から改善点を見つけるフレームワーク
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

      <AffiliateSection itemIds={CATEGORY_AFFILIATE_MAP["analysis"] ?? []} />
      <DisclaimerBox variant="category" />
    </div>
    </>
  );
}
