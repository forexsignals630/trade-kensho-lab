import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AffiliateSection from "@/components/AffiliateSection";
import AuthorBox from "@/components/AuthorBox";
import TableOfContents from "@/components/TableOfContents";
import CalloutBox from "@/components/CalloutBox";
import FAQSection from "@/components/FAQSection";
import ArticleCard from "@/components/ArticleCard";
import ToolCard from "@/components/ToolCard";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getAllArticles, getRelatedArticles } from "@/lib/articles";
import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { ARTICLE_AFFILIATE_MAP } from "@/data/affiliateItems";
import { formatDate } from "@/lib/utils";
import type { ArticleMeta } from "@/types/article";

// ─── Author bios ──────────────────────────────────────────────────────────────

const AUTHOR_BIOS: Record<string, string> = {
  "トレード検証ラボ編集部":
    "トレード記録・リスク管理・検証プロセスを中心に、個人トレーダー向けの実務記事と無料計算ツールを提供しています。",
  "編集部 / トレード検証ラボ":
    "トレード記録・リスク管理・検証プロセスを中心に、個人トレーダー向けの実務記事と無料計算ツールを提供しています。",
};

// ─── Category badge colors ────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "トレード記録": "bg-blue-100 text-blue-700",
  "リスク管理": "bg-green-100 text-green-700",
  "検証・バックテスト": "bg-purple-100 text-purple-700",
  "検証・分析": "bg-purple-100 text-purple-700",
  "TradingView": "bg-orange-100 text-orange-700",
  "VPS運用": "bg-cyan-100 text-cyan-700",
  "比較・レビュー": "bg-pink-100 text-pink-700",
  "テンプレート": "bg-yellow-100 text-yellow-700",
  "ツール解説": "bg-indigo-100 text-indigo-700",
  "初心者向け基礎": "bg-slate-100 text-slate-600",
};

// ─── Tool registry ─────────────────────────────────────────────────────────────

const TOOL_INFO: Record<string, { title: string; description: string; icon: string }> = {
  "lot-calculator": {
    title: "ロット計算ツール",
    description: "口座資金・許容リスク・損切り幅から、取引ロットを計算できます。",
    icon: "🧮",
  },
  "pips-calculator": {
    title: "pips計算ツール",
    description: "エントリー価格と比較価格から、損切り幅や利確幅をpips / pointsで確認できます。",
    icon: "📐",
  },
  "profit-loss-calculator": {
    title: "損益計算ツール",
    description: "通貨ペア・銘柄、ロット数、値幅から想定損益を計算できます。",
    icon: "💵",
  },
  "risk-reward-calculator": {
    title: "リスクリワード計算ツール",
    description: "エントリー価格、利確価格、損切り価格からRR比率を確認できます。",
    icon: "⚖️",
  },
  "expectancy-calculator": {
    title: "期待値計算ツール",
    description: "勝率・平均利益・平均損失から、取引ルールの期待値を計算できます。",
    icon: "📊",
  },
  "drawdown-recovery-calculator": {
    title: "ドローダウン回復計算",
    description: "DD後の回復に必要な利益率を計算します。",
    icon: "📉",
  },
  "pips-profit-calculator": {
    title: "Pips損益計算",
    description: "pipsから損益額を計算します。",
    icon: "💹",
  },
  "spread-cost-calculator": {
    title: "スプレッドコスト計算",
    description: "取引ごとのコストを試算します。",
    icon: "💰",
  },
  "market-hours": {
    title: "マーケット時間帯",
    description: "市場セッション時間を確認します。",
    icon: "🕐",
  },
  "trade-journal-template": {
    title: "トレード日誌作成ツール",
    description: "取引内容を入力して、トレード日誌を作成・保存できます。PDF、CSV、テキスト形式で保存できます。",
    icon: "📓",
  },
  "backtest-sample-size-calculator": {
    title: "バックテストサンプル数",
    description: "必要試行回数を計算します。",
    icon: "🔬",
  },
  "risk-of-ruin-simulator": {
    title: "リスク・オブ・ルイン",
    description: "資産曲線シミュレーションを行います。",
    icon: "🎲",
  },
};

// ─── MDX table wrapper for responsive scroll ─────────────────────────────────

function ResponsiveTable({ children, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto -mx-1 my-6 rounded-lg border border-slate-200">
      <table {...props} className="min-w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

const MDX_OPTIONS = { mdxOptions: { remarkPlugins: [remarkGfm] } };
const MDX_COMPONENTS = {
  CalloutBox,
  table: ResponsiveTable,
};

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllArticles(true).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/articles/${slug}`,
    noindex: (article as { noindex?: boolean }).noindex,
    ogImage: (article as { ogImage?: string }).ogImage,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const author = article.author ?? "編集部 / トレード検証ラボ";
  const authorBio = AUTHOR_BIOS[author];
  const categoryColor = CATEGORY_COLORS[article.category] ?? "bg-slate-100 text-slate-600";

  const relatedToolsData = (article.relatedTools ?? [])
    .map((id) => {
      const info = TOOL_INFO[id];
      return info ? { ...info, href: `/tools/${id}` } : null;
    })
    .filter(Boolean) as Array<{ title: string; description: string; icon: string; href: string }>;

  const preferredSlugs: string[] = article.relatedArticles ?? [];
  const relatedArticles: ArticleMeta[] = preferredSlugs.length > 0
    ? getAllArticles().filter((a) => preferredSlugs.includes(a.slug)).slice(0, 3)
    : getRelatedArticles(slug, 3);

  const faqItems = article.faq ?? [];

  // ── Structured data ──────────────────────────────────────────────────────
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}/articles/${slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "トレード検証ラボ",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Breadcrumbs — ホーム > カテゴリ > タイトル */}
        <Breadcrumbs
          items={[
            { label: article.category, href: `/articles?category=${encodeURIComponent(article.category)}` },
            { label: article.title },
          ]}
        />

        {/* ── Article header ─────────────────────────────────────────────── */}
        <header className="mt-5 mb-6">

          {/* Category + tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColor}`}>
              {article.category}
            </span>
            {article.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                #{tag}
              </span>
            ))}
          </div>

          {/* H1 */}
          <h1 className="text-[28px] sm:text-[38px] lg:text-[42px] font-bold text-slate-900 leading-[1.25] tracking-tight mb-5">
            {article.title}
          </h1>

          {/* Lead text */}
          <p className="text-[17px] sm:text-[18px] text-slate-600 leading-[1.8] max-w-3xl mb-5">
            {article.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 pb-5 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              更新日：{formatDate(article.updatedAt ?? article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              {author}
            </span>
            {article.readingTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                読了目安：約{article.readingTime}分
              </span>
            )}
          </div>
        </header>

        {/* Author mini-card */}
        <AuthorBox
          author={author}
          description={authorBio}
          updatedAt={article.updatedAt ?? article.publishedAt}
          readingTime={article.readingTime}
          className="mb-5"
        />

        {/* Affiliate disclosure */}
        {article.isAffiliate && <AffiliateDisclosure className="mb-8" />}

        {/* ── Main 2-col layout ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">

          {/* ── Main content column ───────────────────────────────────── */}
          <div className="min-w-0">

            {/* Mobile-only TOC card */}
            <div className="lg:hidden bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">この記事の目次</p>
              <TableOfContents />
            </div>

            {/* ── Article body ──────────────────────────────────────── */}
            <article className="prose max-w-none">
              <MDXRemote
                source={article.content}
                components={MDX_COMPONENTS}
                options={MDX_OPTIONS}
              />
            </article>

            {/* Publish / update stamps */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                公開：{formatDate(article.publishedAt)}
              </span>
              {article.updatedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  更新：{formatDate(article.updatedAt)}
                </span>
              )}
            </div>

            {/* ── 関連ツール ───────────────────────────────────────── */}
            {relatedToolsData.length > 0 && (
              <section
                className="mt-12 pt-8 border-t border-slate-200"
                id="related-tools"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  この記事に関連する無料ツール
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  記録と計算を組み合わせて、トレード管理の精度を高めましょう。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedToolsData.slice(0, 3).map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all"
                    >
                      <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center text-2xl mb-3">
                        {tool.icon}
                      </div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors mb-1">
                        {tool.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {tool.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                        ツールを使う <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── 関連記事 ─────────────────────────────────────────── */}
            {relatedArticles.length > 0 && (
              <section
                className="mt-12 pt-8 border-t border-slate-200"
                id="related-articles"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-5">関連記事</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedArticles.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* ── アフィリエイト枠 ─────────────────────────────────── */}
            {article.isAffiliate && (() => {
              const affiliateIds = ARTICLE_AFFILIATE_MAP[article.category] ?? [];
              return affiliateIds.length > 0
                ? <AffiliateSection itemIds={affiliateIds} />
                : null;
            })()}

            {/* ── FAQ ──────────────────────────────────────────────── */}
            {faqItems.length > 0 && (
              <section
                className="mt-12 pt-8 border-t border-slate-200"
                id="faq"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-5">
                  よくある質問（FAQ）
                </h2>
                <FAQSection items={faqItems} />
              </section>
            )}

            {/* Disclaimer */}
            <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold text-slate-600 mb-1.5">免責事項</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                本記事は、トレード記録・計算・検証支援を目的とした一般的な情報です。特定の金融商品の売買を推奨するものではなく、投資助言・利益保証を目的としたものではありません。実際の取引判断はご自身の責任で行ってください。
              </p>
            </div>
          </div>

          {/* ── Sidebar — PC sticky ───────────────────────────────────── */}
          <aside className="hidden lg:block self-start sticky top-24 space-y-6">

            {/* TOC card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                目次
              </p>
              <TableOfContents />
            </div>

            {/* Related tools card */}
            {relatedToolsData.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">関連ツール</h3>
                <div className="space-y-2">
                  {relatedToolsData.map((tool) => (
                    <ToolCard key={tool.href} tool={tool} variant="compact" />
                  ))}
                  <Link
                    href="/tools"
                    className="block text-center text-xs text-brand-600 hover:text-brand-700 font-medium pt-2.5 border-t border-slate-100 mt-2"
                  >
                    全ツールを見る →
                  </Link>
                </div>
              </div>
            )}

            {/* Mini disclaimer */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 mb-1.5">広告開示・免責</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                本記事は記録・計算・検証支援を目的としており、特定の売買判断・利益保証を目的としたものではありません。
              </p>
              <Link
                href="/disclaimer"
                className="text-xs text-brand-600 hover:underline mt-1.5 inline-block"
              >
                免責事項を読む
              </Link>
            </div>
          </aside>
        </div>

        {/* ── Mobile sidebar content (below article) ─────────────────────── */}
        <div className="lg:hidden mt-10 space-y-6">

          {/* Related tools compact list */}
          {relatedToolsData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">関連ツール</h3>
              <div className="space-y-2">
                {relatedToolsData.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} variant="compact" />
                ))}
                <Link
                  href="/tools"
                  className="block text-center text-xs text-brand-600 hover:text-brand-700 font-medium pt-2.5 border-t border-slate-100 mt-2"
                >
                  全ツールを見る →
                </Link>
              </div>
            </div>
          )}

          {/* Mobile mini disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">広告開示・免責</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              本記事は記録・計算・検証支援を目的としており、特定の売買判断・利益保証を目的としたものではありません。
            </p>
            <Link
              href="/disclaimer"
              className="text-xs text-brand-600 hover:underline mt-1.5 inline-block"
            >
              免責事項を読む
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}
