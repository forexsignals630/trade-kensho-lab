import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";
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
  title: "トレード日誌の記事一覧",
  description:
    "トレード日誌の始め方、最低限の記録項目、テンプレート、続けるコツ、振り返り方法に関する実務記事をまとめています。",
  path: "/categories/trade-journal",
});

const RELATED_TOOLS: ToolInfo[] = [
  {
    title: "トレード日誌作成ツール",
    description: "入力してすぐに保存 — PDF・CSV・テキスト形式に対応",
    href: "/tools/trade-journal-template",
    icon: "📓",
    badge: "NEW",
  },
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
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "トレード日誌の記事一覧",
  description: "トレード日誌の始め方、最低限の記録項目、テンプレート、続けるコツ、振り返り方法に関する実務記事。",
  url: `${SITE_URL}/categories/trade-journal`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function TradeJournalCategoryPage() {
  const articles = getAllArticles().filter(
    (a) =>
      ["トレード記録", "テンプレート"].includes(a.category) ||
      a.slug === "how-to-use-trade-journal-tool"
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "カテゴリ一覧", href: "/categories" },
          { label: "トレード日誌" },
        ]}
      />

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">トレード日誌</h1>
        </div>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          トレード日誌の始め方、最低限の記録項目、テンプレート、続けるコツ、振り返り方法をまとめています。
        </p>
      </div>

      {/* Category description card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 mb-8">
        <h2 className="text-sm font-bold text-blue-900 mb-2">このカテゴリで学べること</h2>
        <ul className="space-y-1.5 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
            トレード日誌に最低限記録しておきたい項目の選び方
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
            Notion・スプレッドシート・アプリを使った記録方法
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
            週次・月次の振り返りで改善点を見つける方法
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
            日誌を継続するための実務的なコツ
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

      {/* Fintokei Wide Banner */}
      <div className="relative mb-8 banner-hover-lift">
        <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">PR</span>
        <a
          href="https://www.fintokei.com/jp/?affiliate=987"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-slate-100"
        >
          <Image src="/images/affiliates/fintokei_banner.png" alt="Fintokei" width={1200} height={210} className="w-full h-auto" />
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

      <AffiliateSection itemIds={CATEGORY_AFFILIATE_MAP["trade-journal"] ?? []} />
      <DisclaimerBox variant="category" />
    </div>
    </>
  );
}
