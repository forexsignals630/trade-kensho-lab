import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import { getArticlesByCategory, getAllArticles } from "@/lib/articles";
import { buildMetadata } from "@/lib/metadata";
import type { ArticleCategory } from "@/types/article";

const VALID_CATEGORIES: ArticleCategory[] = [
  "トレード記録",
  "リスク管理",
  "検証・バックテスト",
  "TradingView",
  "VPS運用",
  "比較・レビュー",
  "テンプレート",
  "初心者向け基礎",
];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: encodedCategory } = await params;
  const category = decodeURIComponent(encodedCategory);

  return buildMetadata({
    title: `${category}の記事一覧`,
    description: `${category}に関する記事一覧です。個人トレーダーの実務に役立つ情報を提供します。`,
    path: `/articles/category/${encodedCategory}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: encodedCategory } = await params;
  const category = decodeURIComponent(encodedCategory);

  if (!VALID_CATEGORIES.includes(category as ArticleCategory)) {
    notFound();
  }

  const articles = getArticlesByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "記事一覧", href: "/articles" },
          { label: category },
        ]}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{category}の記事</h1>
        <p className="text-slate-600">{articles.length}件の記事があります</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-4">📄</p>
          <p>このカテゴリの記事はまだありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}

      <DisclaimerBox />
    </div>
  );
}
