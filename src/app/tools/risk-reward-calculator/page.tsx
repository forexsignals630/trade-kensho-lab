import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";
import RiskRewardCalculatorClient from "./RiskRewardCalculatorClient";

export const metadata = buildMetadata({
  title: "リスクリワード計算ツール",
  description:
    "エントリー価格、利確価格、ストップロス価格からリスクリワード比率を計算できる無料ツールです。FX・CFDの取引前確認やトレード記録に活用できます。",
  path: "/tools/risk-reward-calculator",
});

// ─── WebApplication JSON-LD ──────────────────────────────────────────────────

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "リスクリワード計算ツール",
  description:
    "エントリー価格・利確価格・ストップロス価格からリスクリワード比率を計算する無料ツール。FX通貨ペアおよびCFD銘柄（XAUUSD・BTCUSD・JP225・US100・US500）に対応。",
  url: `${SITE_URL}/tools/risk-reward-calculator`,
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

const RELATED_SLUGS = ["how-to-use-risk-reward-calculator", "trade-journal-basics"];

export default function RiskRewardCalculatorPage() {
  const articles = getAllArticles().filter((a) => RELATED_SLUGS.includes(a.slug));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <RiskRewardCalculatorClient relatedArticles={articles} />
    </>
  );
}
