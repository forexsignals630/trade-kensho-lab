import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import FAQSection from "@/components/FAQSection";
import ToolCard from "@/components/ToolCard";
import type { ToolInfo } from "@/components/ToolCard";
import { getAllArticles } from "@/lib/articles";
import { buildMetadata } from "@/lib/metadata";
import ArticlesClient from "./ArticlesClient";

export const metadata = buildMetadata({
  title: "記事一覧",
  description:
    "トレード検証ラボの記事一覧ページです。トレード日誌、リスク管理、ロット計算、リスクリワード、検証方法に関する実務記事を掲載しています。",
  path: "/articles",
});

const RECOMMENDED_TOOLS: ToolInfo[] = [
  {
    title: "ロット計算ツール",
    description: "口座資金・リスク率・損切り幅からロット数を計算",
    href: "/tools/lot-calculator",
    icon: "🧮",
    badge: "人気",
  },
  {
    title: "リスクリワード計算ツール",
    description: "RR比と損益分岐勝率を算出",
    href: "/tools/risk-reward-calculator",
    icon: "⚖️",
  },
  {
    title: "期待値計算ツール",
    description: "戦略の期待値をR単位で確認",
    href: "/tools/expectancy-calculator",
    icon: "📊",
  },
];

const FAQ_ITEMS = [
  {
    question: "記事はどのようなトレーダー向けですか？",
    answer:
      "主にFX・CFD・株価指数の個人トレーダーを対象に、取引の記録・リスク管理・検証プロセスを支援する実務的な内容を掲載しています。",
  },
  {
    question: "ロット計算やリスク管理の記事はどこで読めますか？",
    answer:
      "「リスク管理」フィルターにロット計算、リスクリワード、期待値、損切り幅に関する記事をまとめています。上部のフィルターボタンから絞り込んでご確認ください。",
  },
  {
    question: "トレード日誌の始め方が知りたいです",
    answer:
      "「トレード日誌」フィルターに、記録項目の選び方・テンプレート・続けるコツに関する記事をまとめています。「トレード日誌とは？最低限の記録項目と続けるコツ」の記事からお読みください。",
  },
  {
    question: "計算ツールと記事はどう使い分ければよいですか？",
    answer:
      "記事で概念や使い方を理解した後、無料計算ツールで実際の数値を入力して確認する流れをおすすめします。各記事の末尾に関連ツールへのリンクを掲載しています。",
  },
];

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "記事一覧" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">記事一覧</h1>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          トレード記録、リスク管理、ロット計算、リスクリワード、期待値、検証方法に関する実務記事をまとめています。
        </p>
      </div>

      <ArticlesClient articles={articles} />

      {/* Funded7 Wide Banner */}
      <div className="relative mt-4 mb-10 banner-hover-lift">
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

      {/* おすすめ無料ツール */}
      <section className="mt-4 mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">おすすめ無料ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RECOMMENDED_TOOLS.map((tool) => (
            <ToolCard key={tool.href} tool={tool} variant="compact" />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">よくある質問</h2>
        <FAQSection items={FAQ_ITEMS} />
      </section>

      <DisclaimerBox variant="category" />
    </div>
  );
}
