import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";
import TradeJournalTemplateClient from "./TradeJournalTemplateClient";

export const metadata = buildMetadata({
  title: "トレード日誌作成ツール",
  description:
    "通貨ペア・銘柄、エントリー価格、ストップロス価格、ロット数、エントリー理由、結果、振り返りを入力して、トレード日誌を作成・ダウンロードできる無料ツールです。",
  path: "/tools/trade-journal-template",
});

// ─── WebApplication JSON-LD ──────────────────────────────────────────────────

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "トレード日誌作成ツール",
  description:
    "取引内容を入力してトレード日誌を自動生成できます。Markdown、CSV、テキスト形式でダウンロードできる無料の記録支援ツールです。",
  url: `${SITE_URL}/tools/trade-journal-template`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  inLanguage: "ja",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  publisher: {
    "@type": "Organization",
    name: "トレード検証ラボ",
    url: SITE_URL,
  },
};

const RELATED_SLUGS = [
  "how-to-use-trade-journal-tool",
  "trade-journal-basics",
  "trade-review-weekend",
];

export default function TradeJournalTemplatePage() {
  const articles = getAllArticles().filter((a) => RELATED_SLUGS.includes(a.slug));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <TradeJournalTemplateClient relatedArticles={articles} />
    </>
  );
}
