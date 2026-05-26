import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calculator, BookOpen, Shield, TrendingUp } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import ArticleCard from "@/components/ArticleCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import AffiliateSection from "@/components/AffiliateSection";
import { getAllArticles } from "@/lib/articles";
import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { HOME_AFFILIATE_IDS } from "@/data/affiliateItems";
import type { ToolInfo } from "@/components/ToolCard";

export const metadata = buildMetadata({
  // spec: "トレード検証ラボ | 記録・計算・検証支援ツール"
  // buildMetadata prepends title, so pass the right-side part:
  title: "記録・計算・検証支援ツール",
  description:
    "トレード日誌、ロット計算、リスクリワード、期待値など、個人トレーダーの記録・計算・検証を支援する無料ツールと実務記事を提供します。",
  path: "/",
});

// ─── WebSite + Organization JSON-LD ─────────────────────────────────────────

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "トレード検証ラボ",
      url: SITE_URL,
      description:
        "個人トレーダーの記録・計算・検証を支援する実務メディア。トレード日誌、ロット計算、リスクリワード、期待値ツールを無料提供。",
      inLanguage: "ja",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "トレード検証ラボ",
      url: SITE_URL,
      description:
        "トレード記録・計算・検証支援を目的とした実務メディア。特定の売買判断・投資助言・利益保証を目的としていません。",
    },
  ],
};

const FEATURED_TOOLS: ToolInfo[] = [
  {
    title: "ロット計算ツール",
    description: "口座資金とリスク率から適切なロット数を計算",
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
    description: "取引内容を入力してPDF・CSV・テキスト形式で保存",
    href: "/tools/trade-journal-template",
    icon: "📓",
    badge: "NEW",
  },
];

const CATEGORIES = [
  { label: "トレード日誌", icon: "📓", href: "/categories/trade-journal", desc: "日誌・記録の付け方" },
  { label: "リスク管理", icon: "🛡️", href: "/categories/risk-management", desc: "ロット・DD管理" },
  { label: "検証・分析", icon: "🔬", href: "/categories/analysis", desc: "戦略の検証方法" },
  { label: "ツール解説", icon: "🔧", href: "/categories/tools", desc: "各ツールの使い方" },
  { label: "TradingView", icon: "📈", href: "/articles?category=TradingView", desc: "チャートツール活用" },
  { label: "VPS運用", icon: "🖥️", href: "/articles?category=VPS運用", desc: "EA自動化・環境構築" },
];

export default function HomePage() {
  const articles = getAllArticles().slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      {/* Hero */}
      <section className="bg-brand-800 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">

            {/* Left: Copy */}
            <div>
              <span className="inline-block bg-white/15 border border-white/25 text-white/90 text-xs font-medium px-3.5 py-1.5 rounded-full mb-5">
                個人トレーダーのための検証支援メディア
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-snug mb-5 tracking-tight">
                トレードの記録・検証・改善を
                <br />
                <span className="text-brand-200">数字で見える化する</span>
              </h1>
              <p className="text-white/75 text-sm sm:text-base mb-7 max-w-[560px]" style={{ lineHeight: 1.85 }}>
                ロット計算・pips計算・リスクリワード・期待値・トレード日誌まで。毎日の取引を「感覚の反省」で終わらせず、検証に使えるデータへ変えるための<span className="whitespace-nowrap">無料ツール</span>と実務記事を提供します。
              </p>
              <div className="flex flex-wrap gap-3 mb-5">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
                >
                  <Calculator className="w-4 h-4" />
                  無料ツールを使う
                </Link>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-xl transition-colors border border-white/25 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  検証記事を読む
                </Link>
              </div>
              <p className="text-white/65 text-xs leading-relaxed">
                ※売買判断・投資助言は行いません。記録・計算・検証支援を目的とした情報です。
              </p>
            </div>

            {/* Right: Dashboard Card */}
            <div className="flex lg:justify-end">
              <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-[440px] mx-auto lg:mx-0">

                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Trade Check Panel</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">計算サンプル</span>
                </div>

                {/* Input Values */}
                <div className="bg-slate-50 rounded-xl p-3.5 mb-3 space-y-2.5">
                  {[
                    { label: "口座資金", value: "1,000,000 円" },
                    { label: "許容リスク", value: "1.0 %" },
                    { label: "損切り幅", value: "25 pips" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{row.label}</span>
                      <span className="text-xs font-semibold text-slate-700 tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Lot Result */}
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-3.5 mb-3 text-center">
                  <p className="text-xs text-brand-600 font-medium mb-0.5">推奨ロット</p>
                  <p className="text-3xl font-extrabold text-brand-700 tabular-nums leading-none">
                    0.40 <span className="text-xl font-bold">lot</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">リスク1%・25pips損切りで算出</p>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "RR比率", value: "1 : 2.1", cls: "text-slate-700" },
                    { label: "期待値", value: "+0.34R", cls: "text-green-600" },
                    { label: "記録率", value: "87%", cls: "text-brand-600" },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className={`text-xs font-bold tabular-nums ${m.cls}`}>{m.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-tight">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Memo */}
                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                    <p className="text-xs font-semibold text-slate-600">今日の検証メモ</p>
                  </div>
                  <ul className="space-y-1">
                    {["エントリー根拠を記録", "損切り位置を事前設定", "決済後にスクショ保存"].map((item) => (
                      <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                        <span className="text-slate-300 leading-4">・</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Calculator className="w-5 h-5 text-brand-600" />, title: "取引前にリスクを計算", desc: "ロット・RR・期待値を事前に確認" },
              { icon: <BookOpen className="w-5 h-5 text-brand-600" />, title: "記録から改善点を発見", desc: "トレード日誌から検証に活かす" },
              { icon: <Shield className="w-5 h-5 text-brand-600" />, title: "売買判断ではなく検証支援", desc: "投資助言ではなく計算・記録を支援" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 space-y-16">

        {/* Featured Tools */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">よく使われるツール</h2>
              <p className="text-sm text-slate-500 mt-1">取引前の準備・検証に役立つ計算ツール</p>
            </div>
            <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
              全て見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_TOOLS.map((tool) => (
              <ToolCard key={tool.href} tool={tool} variant="compact" />
            ))}
          </div>
        </section>

        {/* Vantage Banner */}
        <section className="relative banner-hover-lift">
          <span className="absolute top-2 right-2 z-10 text-[10px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded leading-none tracking-wide">
            PR
          </span>
          <a
            href="https://www.vantagetradings.com/open-live-account/?affid=MTUwMzY0"
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="block rounded-xl overflow-hidden border border-slate-100"
          >
            <Image
              src="/images/affiliates/vantage_1.jpg"
              alt="Vantage"
              width={1200}
              height={160}
              className="w-full h-auto"
              priority
            />
          </a>
        </section>

        {/* Category Navigation */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">悩み別に探す</h2>
            <p className="text-sm text-slate-500 mt-1">カテゴリから目的の記事・ツールを探せます</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 transition-colors leading-tight">
                    {cat.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        {articles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">新着記事</h2>
                <p className="text-sm text-slate-500 mt-1">トレード改善に役立つ最新の解説記事</p>
              </div>
              <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
                全て見る <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="bg-brand-50 border border-brand-100 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">全ての計算ツール</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                ロット計算・pips計算・リスクリワード・期待値・損益計算・トレード日誌作成など
                6種類の無料ツールを提供しています
              </p>
            </div>
            <Link
              href="/tools"
              className="shrink-0 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              ツール一覧へ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Affiliate Section */}
        <AffiliateSection
          itemIds={HOME_AFFILIATE_IDS}
          heading="検証環境を整える参考サービス"
          description="トレード記録・チャート確認・検証作業を効率化したい場合に参考になる外部サービスを掲載します。掲載内容は記録・分析環境の整備を目的としており、売買判断を推奨するものではありません。"
        />

        <DisclaimerBox />
      </div>
    </>
  );
}
