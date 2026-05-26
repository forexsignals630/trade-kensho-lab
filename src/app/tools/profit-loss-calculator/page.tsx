import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";
import ProfitLossCalculatorClient from "./ProfitLossCalculatorClient";

export const metadata = buildMetadata({
  title: "損益計算ツール",
  description:
    "通貨ペア・銘柄、ロット数、値幅から想定損益を計算できる無料ツールです。FX通貨ペア、XAUUSD、BTCUSD、株価指数CFDの損益確認に活用できます。",
  path: "/tools/profit-loss-calculator",
});

// ─── WebApplication JSON-LD ──────────────────────────────────────────────────

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "損益計算ツール",
  description:
    "通貨ペア・銘柄、ロット数、値幅から想定損益を計算できます。FX通貨ペア、XAUUSD、BTCUSD、株価指数CFDに対応した無料ツールです。",
  url: `${SITE_URL}/tools/profit-loss-calculator`,
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
  "how-to-use-profit-loss-calculator",
  "how-to-use-pips-calculator",
];

export default function ProfitLossCalculatorPage() {
  const articles = getAllArticles().filter((a) => RELATED_SLUGS.includes(a.slug));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <ProfitLossCalculatorClient relatedArticles={articles} />
    </>
  );
}
