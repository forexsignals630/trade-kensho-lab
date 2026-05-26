import Link from "next/link";
import { BookOpen, Shield, Wrench, BarChart2, ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";

export const metadata = buildMetadata({
  title: "カテゴリ一覧",
  description:
    "トレード検証ラボのコンテンツをテーマ別に探せます。トレード日誌・リスク管理・ツール解説・検証分析に関する記事と計算ツールを掲載しています。",
  path: "/categories",
});

const CATEGORY_DEFS = [
  {
    key: "trade-journal" as const,
    title: "トレード日誌",
    description: "記録項目、テンプレート、振り返り方を解説します。",
    href: "/categories/trade-journal",
    Icon: BookOpen,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "risk-management" as const,
    title: "リスク管理",
    description: "ロット計算、損切り幅、リスクリワード、許容リスク率を解説します。",
    href: "/categories/risk-management",
    Icon: Shield,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    key: "tools" as const,
    title: "ツール解説",
    description: "無料計算ツールの使い方や計算式を解説します。",
    href: "/categories/tools",
    Icon: Wrench,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    key: "analysis" as const,
    title: "検証・分析",
    description: "取引データの見返し方、期待値、改善点の見つけ方を解説します。",
    href: "/categories/analysis",
    Icon: BarChart2,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "カテゴリ一覧",
  description:
    "トレード検証ラボのコンテンツをテーマ別に探せます。記録・リスク管理・検証・ツール解説に関する記事と計算ツールを掲載。",
  url: `${SITE_URL}/categories`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function CategoriesPage() {
  const allArticles = getAllArticles();

  // Compute counts using the same filters as each category page
  const counts: Record<string, number> = {
    "trade-journal": allArticles.filter(
      (a) =>
        ["トレード記録", "テンプレート"].includes(a.category) ||
        a.slug === "how-to-use-trade-journal-tool"
    ).length,
    "risk-management": allArticles.filter(
      (a) =>
        a.category === "リスク管理" ||
        ["how-to-use-lot-calculator", "how-to-use-risk-reward-calculator"].includes(a.slug)
    ).length,
    tools: allArticles.filter(
      (a) =>
        a.category === "TradingView" ||
        a.category === "ツール解説" ||
        Boolean(a.tags?.some((t) => ["ツール", "ツール比較", "チャート"].includes(t)))
    ).length,
    analysis: allArticles.filter(
      (a) =>
        ["検証・バックテスト", "検証・分析", "比較・レビュー"].includes(a.category) ||
        ["how-to-use-expected-value-calculator", "trade-review-weekend"].includes(a.slug)
    ).length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "カテゴリ一覧" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          カテゴリ一覧
        </h1>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          トレード検証ラボのコンテンツを、記録・リスク管理・検証・ツール解説などのテーマ別に探せます。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {CATEGORY_DEFS.map(({ key, title, description, href, Icon, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-300 hover:shadow-md transition-all flex flex-col"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg} ${iconColor}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
              {title}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
              {description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{counts[key]}件の記事</span>
              <span className="flex items-center gap-1 text-xs font-medium text-brand-600">
                記事を読む <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Link to full article list */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">全記事をまとめて確認したい方はこちら</p>
        <Link
          href="/articles"
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          記事一覧を見る <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
    </>
  );
}
